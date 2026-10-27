import mongoose from 'mongoose';
import ChartOfAccount from '../models/ChartOfAccount.model';
import JournalEntry, { IJournalEntryLine } from '../models/JournalEntry.model';
import { FinancialPeriod } from '../models/FinancialPeriod.model';
import { Budget } from '../models/Budget.model';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';

export class AccountingService {
  private tenantId: mongoose.Types.ObjectId;

  constructor(tenantId: string) {
    this.tenantId = new mongoose.Types.ObjectId(tenantId);
  }

  // ==========================
  // CHART OF ACCOUNTS
  // ==========================
  async getChartOfAccounts() {
    return ChartOfAccount.find({ tenantId: this.tenantId, isDeleted: { $ne: true } }).lean();
  }

  async createAccount(data: any) {
    return ChartOfAccount.create({ ...data, tenantId: this.tenantId });
  }

  async updateAccount(id: string, data: any) {
    const updated = await ChartOfAccount.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, data, { new: true });
    if (!updated) throw new NotFoundError('Account not found');
    return updated;
  }

  async deleteAccount(id: string) {
    const deleted = await ChartOfAccount.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, { isDeleted: true }, { new: true });
    if (!deleted) throw new NotFoundError('Account not found');
    return deleted;
  }

  // ==========================
  // DOUBLE ENTRY POSTING
  // ==========================
  async postJournal(data: {
    journalNumber: string;
    date: Date;
    description: string;
    lines: IJournalEntryLine[];
    sourceType?: string;
    sourceId?: string;
    postedBy?: string;
  }) {
    // 1. Double-Entry Validation (Debit == Credit)
    const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

    if (totalDebit !== totalCredit) {
      throw new ValidationError(`Journal is out of balance. Debit: ${totalDebit}, Credit: ${totalCredit}`);
    }
    if (totalDebit <= 0) {
      throw new ValidationError('Journal must have a non-zero amount');
    }

    // 2. Idempotency Check
    if (data.sourceType && data.sourceId) {
      const existing = await JournalEntry.findOne({
        tenantId: this.tenantId,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        status: { $ne: 'REVERSED' }
      });
      if (existing) {
        // Idempotency constraint met, return existing to avoid duplicate posting
        return existing;
      }
    }

    // 3. Period Lock Check
    const activePeriod = await FinancialPeriod.findOne({
      tenantId: this.tenantId,
      startDate: { $lte: data.date },
      endDate: { $gte: data.date },
    });

    if (!activePeriod) {
      throw new ValidationError('No active financial period found for this date.');
    }
    if (activePeriod.status !== 'OPEN') {
      throw new ValidationError(`Cannot post journal to a ${activePeriod.status} financial period.`);
    }
    // 4. Save and Post
    const journal = new JournalEntry({
      ...data,
      tenantId: this.tenantId,
      financialPeriodId: activePeriod._id,
      totalDebit,
      totalCredit,
      status: 'POSTED',
      postedAt: new Date(),
    });

    await journal.save();

    // 5. Update Budgets (if Expense)
    // For every debit to an expense account, we increment the budget usedAmount
    for (const line of data.lines) {
      if (line.debit > 0) {
        const account = await ChartOfAccount.findById(line.accountId);
        if (account && account.accountType === 'EXPENSE') {
          await Budget.findOneAndUpdate(
            { tenantId: this.tenantId, accountId: line.accountId, status: 'APPROVED' },
            { $inc: { usedAmount: line.debit } },
            { new: true } // Let pre-save hook recalculate remainingAmount? findOneAndUpdate doesn't trigger pre-save by default unless runValidators is true, but it's simpler to just increment. Actually I will do find and save.
          );
          
          const budget = await Budget.findOne({ tenantId: this.tenantId, accountId: line.accountId, status: 'APPROVED' });
          if (budget) {
            budget.usedAmount += line.debit;
            await budget.save(); // triggers remainingAmount recalculation
          }
        }
      }
    }

    return journal;
  }

  // ==========================
  // REPORTING
  // ==========================
  async getGeneralLedger(accountId: string, startDate?: Date, endDate?: Date) {
    const query: any = { tenantId: this.tenantId, 'lines.accountId': new mongoose.Types.ObjectId(accountId), status: 'POSTED' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    return JournalEntry.find(query).sort({ date: 1 }).lean();
  }

  async getTrialBalance() {
    // Aggregate all posted journals to calculate net balances per account
    const pipeline = [
      { $match: { tenantId: this.tenantId, status: 'POSTED' } },
      { $unwind: '$lines' },
      {
        $group: {
          _id: '$lines.accountId',
          totalDebit: { $sum: '$lines.debit' },
          totalCredit: { $sum: '$lines.credit' },
        }
      },
      {
        $lookup: {
          from: 'chartofaccounts',
          localField: '_id',
          foreignField: '_id',
          as: 'account'
        }
      },
      { $unwind: '$account' },
      {
        $project: {
          accountCode: '$account.accountCode',
          accountName: '$account.accountName',
          accountType: '$account.accountType',
          totalDebit: 1,
          totalCredit: 1,
        }
      },
      { $sort: { 'accountCode': 1 } as any }
    ];

    const balances = await JournalEntry.aggregate(pipeline);
    const totals = balances.reduce((acc: any, curr: any) => {
      acc.debit += curr.totalDebit;
      acc.credit += curr.totalCredit;
      return acc;
    }, { debit: 0, credit: 0 });

    return { balances, totals, isBalanced: totals.debit === totals.credit };
  }

  // ==========================
  // BUDGETS
  // ==========================
  async getBudgets(filter: any = {}) {
    return Budget.find({ tenantId: this.tenantId, ...filter }).populate('accountId', 'accountName accountCode');
  }

  async createBudget(data: any) {
    return Budget.create({ ...data, tenantId: this.tenantId });
  }

  async updateBudget(id: string, data: any) {
    const updated = await Budget.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, data, { new: true });
    if (!updated) throw new NotFoundError('Budget not found');
    return updated;
  }

  async deleteBudget(id: string) {
    const deleted = await Budget.findOneAndDelete({ _id: id, tenantId: this.tenantId });
    if (!deleted) throw new NotFoundError('Budget not found');
    return deleted;
  }
}
