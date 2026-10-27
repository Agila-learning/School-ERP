import mongoose from 'mongoose';
import { AccountingService } from './accounting.service';
import ChartOfAccount from '../models/ChartOfAccount.model';

export class FinanceSyncService {
  /**
   * Translates a successful fee payment into a Double-Entry Journal.
   * Debit: Bank / Cash (Asset)
   * Credit: Fee Income (Income)
   */
  static async syncPaymentToLedger(tenantId: string, payment: any) {
    const accounting = new AccountingService(tenantId);
    
    // Find the system accounts for standard mapping
    const bankAccount = await ChartOfAccount.findOne({ tenantId, systemCode: 'BANK' });
    const feeIncomeAccount = await ChartOfAccount.findOne({ tenantId, systemCode: 'FEE_INCOME' });

    if (!bankAccount || !feeIncomeAccount) {
      console.warn('System accounts (BANK, FEE_INCOME) not configured. Skipping ledger sync.');
      return;
    }

    // Prepare journal lines
    const lines = [
      {
        accountId: bankAccount._id,
        debit: payment.amount,
        credit: 0,
        description: `Payment received for ${payment.studentId}`,
      },
      {
        accountId: feeIncomeAccount._id,
        debit: 0,
        credit: payment.amount,
        description: `Fee Income from ${payment.studentId}`,
      }
    ];

    // Post the journal
    try {
      await accounting.postJournal({
        journalNumber: `PAY-${payment._id}`,
        date: payment.createdAt || new Date(),
        description: `Auto-generated journal for Payment ${payment._id}`,
        lines,
        sourceType: 'PAYMENT',
        sourceId: payment._id.toString(),
        postedBy: payment.processedBy?.toString()
      });
    } catch (error) {
      console.error(`Failed to sync payment ${payment._id} to ledger:`, error);
      // In a real production system, this might push to a Dead Letter Queue for retry
    }
  }
}
