import mongoose from 'mongoose';
import Invoice from '../models/Invoice.model';

export class FinanceSchedulerService {
  /**
   * Run daily to transition DRAFT or ISSUED/PARTIALLY_PAID invoices to OVERDUE if past due date.
   */
  static async updateOverdueInvoices(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Find all invoices that are not PAID and have a due date in the past
    const overdueInvoices = await Invoice.updateMany(
      {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        status: { $in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID'] },
        dueDate: { $lt: today },
        isDeleted: { $ne: true }
      },
      {
        $set: { status: 'OVERDUE' }
      }
    );

    return overdueInvoices.modifiedCount;
  }
}
