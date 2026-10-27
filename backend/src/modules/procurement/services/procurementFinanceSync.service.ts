import mongoose from 'mongoose';
import { AccountingService } from '../../accounting/services/accounting.service';
import ChartOfAccount from '../../accounting/models/ChartOfAccount.model';
import SupplierInvoice from '../models/SupplierInvoice.model';
import Vendor from '../../vendors/models/Vendor.model';

export class ProcurementFinanceSyncService {
  /**
   * Posts an Accounts Payable (Liability) Journal Entry when a Supplier Invoice is approved.
   * Debit: Inventory / Expense Account
   * Credit: Accounts Payable (Vendor Liability)
   */
  static async syncApprovedInvoiceToLedger(tenantId: string, invoiceId: string, processedBy: string) {
    const invoice = await SupplierInvoice.findOne({ _id: invoiceId, tenantId }).populate('items.itemId');
    if (!invoice) return;
    
    if (invoice.status !== 'APPROVED_FOR_PAYMENT') {
      console.warn(`Invoice ${invoiceId} is not approved for payment. Skipping ledger sync.`);
      return;
    }

    const vendor = await Vendor.findOne({ _id: invoice.vendorId, tenantId });
    const accounting = new AccountingService(tenantId);
    
    // In a real system, these would be mapped via System Codes or specific item accounts
    const accountsPayableAccount = await ChartOfAccount.findOne({ tenantId, systemCode: 'ACCOUNTS_PAYABLE' });
    const defaultExpenseAccount = await ChartOfAccount.findOne({ tenantId, systemCode: 'PROCUREMENT_EXPENSE' });

    if (!accountsPayableAccount || !defaultExpenseAccount) {
      console.warn('System accounts (ACCOUNTS_PAYABLE, PROCUREMENT_EXPENSE) not configured. Skipping ledger sync.');
      return;
    }

    const lines = [
      {
        accountId: defaultExpenseAccount._id,
        debit: invoice.grandTotal, // Increase Expense (or Asset if inventory)
        credit: 0,
        description: `Procurement expense for Invoice ${invoice.invoiceNumber}`,
      },
      {
        accountId: accountsPayableAccount._id,
        debit: 0,
        credit: invoice.grandTotal, // Increase Liability
        description: `Payable to Vendor ${vendor?.displayName || invoice.vendorId}`,
      }
    ];

    try {
      await accounting.postJournal({
        journalNumber: `INV-${invoice._id}`,
        date: new Date(),
        description: `Auto-generated AP journal for Supplier Invoice ${invoice.invoiceNumber}`,
        lines,
        sourceType: 'SUPPLIER_INVOICE',
        sourceId: invoice._id.toString(),
        postedBy: processedBy
      });
    } catch (error) {
      console.error(`Failed to sync invoice ${invoice._id} to AP ledger:`, error);
    }
  }
}
