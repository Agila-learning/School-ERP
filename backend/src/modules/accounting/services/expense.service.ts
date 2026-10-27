import mongoose from 'mongoose';
import Expense from '../models/Expense.model';
import { AccountingService } from './accounting.service';
import ChartOfAccount from '../models/ChartOfAccount.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class ExpenseService {
  private tenantId: mongoose.Types.ObjectId;

  constructor(tenantId: string) {
    this.tenantId = new mongoose.Types.ObjectId(tenantId);
  }

  async createExpense(data: any, userId: string) {
    return Expense.create({
      ...data,
      tenantId: this.tenantId,
      submittedBy: new mongoose.Types.ObjectId(userId)
    });
  }

  async getExpenses(query: any = {}) {
    return Expense.find({ ...query, tenantId: this.tenantId, isDeleted: { $ne: true } })
      .populate('vendorId', 'vendorName')
      .populate('submittedBy', 'firstName lastName')
      .sort({ date: -1 });
  }

  async approveAndPayExpense(expenseId: string, approvedByUserId: string) {
    const expense = await Expense.findOne({ _id: expenseId, tenantId: this.tenantId });
    if (!expense) throw new NotFoundError('Expense not found');
    if (expense.status !== 'PENDING') throw new ValidationError('Only pending expenses can be approved');

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      expense.status = 'PAID';
      expense.approvedBy = new mongoose.Types.ObjectId(approvedByUserId);
      await expense.save({ session });

      // Find system accounts for posting
      const expenseAccount = await ChartOfAccount.findOne({ tenantId: this.tenantId, systemCode: 'OPERATIONAL_EXPENSE' }).session(session);
      const bankAccount = await ChartOfAccount.findOne({ tenantId: this.tenantId, systemCode: 'BANK' }).session(session);

      if (!expenseAccount || !bankAccount) {
        throw new ValidationError('System accounts (OPERATIONAL_EXPENSE, BANK) must be configured before paying expenses');
      }

      // Automatically post to general ledger
      const accountingService = new AccountingService(this.tenantId.toString());
      await accountingService.postJournal({
        journalNumber: `JE-EXP-${Date.now()}`,
        date: new Date(),
        description: `Expense Payment: ${expense.description}`,
        sourceType: 'EXPENSE',
        sourceId: expense._id.toString(),
        postedBy: approvedByUserId,
        lines: [
          { accountId: expenseAccount._id as mongoose.Types.ObjectId, debit: expense.netAmount, credit: 0 },
          { accountId: bankAccount._id as mongoose.Types.ObjectId, debit: 0, credit: expense.netAmount }
        ]
      });

      await session.commitTransaction();
      session.endSession();
      return expense;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
