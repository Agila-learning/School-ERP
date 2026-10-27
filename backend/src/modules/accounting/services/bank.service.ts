import mongoose from 'mongoose';
import BankAccount from '../models/BankAccount.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class BankService {
  private tenantId: mongoose.Types.ObjectId;

  constructor(tenantId: string) {
    this.tenantId = new mongoose.Types.ObjectId(tenantId);
  }

  async getBankAccounts() {
    return BankAccount.find({ tenantId: this.tenantId, isDeleted: { $ne: true } })
      .populate('linkedAccountId', 'accountName accountCode');
  }

  async createBankAccount(data: any) {
    return BankAccount.create({ ...data, tenantId: this.tenantId });
  }

  // Real implementations would include bank statement CSV import and parsing here,
  // matching logic against JournalEntry records for the linkedAccountId,
  // and saving the results into BankReconciliation.model.ts
}
