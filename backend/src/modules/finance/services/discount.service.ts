import mongoose from 'mongoose';
import ScholarshipDiscount from '../models/ScholarshipDiscount.model';
import Invoice from '../models/Invoice.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class DiscountService {
  private tenantId: mongoose.Types.ObjectId;

  constructor(tenantId: string) {
    this.tenantId = new mongoose.Types.ObjectId(tenantId);
  }

  async getDiscounts(query: any = {}) {
    return ScholarshipDiscount.find({ ...query, tenantId: this.tenantId, isDeleted: { $ne: true } }).populate('feeHeadId');
  }

  async createDiscount(data: any, approvedByUserId: string) {
    return ScholarshipDiscount.create({
      ...data,
      tenantId: this.tenantId,
      approvedByUserId: new mongoose.Types.ObjectId(approvedByUserId)
    });
  }

  async updateDiscount(id: string, data: any) {
    const discount = await ScholarshipDiscount.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, data, { new: true });
    if (!discount) throw new NotFoundError('Discount not found');
    return discount;
  }

  async deactivateDiscount(id: string) {
    const discount = await ScholarshipDiscount.findOneAndUpdate({ _id: id, tenantId: this.tenantId }, { isActive: false }, { new: true });
    if (!discount) throw new NotFoundError('Discount not found');
    return discount;
  }

  /**
   * Apply a discount to a specific invoice
   */
  async applyDiscountToInvoice(invoiceId: string, discountId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoice = await Invoice.findOne({ _id: invoiceId, tenantId: this.tenantId }).session(session);
      if (!invoice) throw new NotFoundError('Invoice not found');
      if (invoice.status === 'PAID') throw new ValidationError('Cannot apply discount to fully paid invoice');

      const discount = await ScholarshipDiscount.findOne({ _id: discountId, tenantId: this.tenantId }).session(session);
      if (!discount) throw new NotFoundError('Discount not found');
      if (!discount.isActive) throw new ValidationError('Discount is not active');

      // Check if discount student matches invoice student
      if (discount.studentId.toString() !== invoice.studentId.toString()) {
        throw new ValidationError('This discount is not applicable for this student');
      }

      let discountAmount = 0;
      if (discount.feeHeadId) {
        // Apply only to a specific fee head item
        const item = invoice.items.find((i: any) => i.feeHeadId.toString() === discount.feeHeadId?.toString());
        if (!item) throw new ValidationError('Applicable fee head not found in invoice');
        
        const applicableAmount = item.amount;
        discountAmount = discount.type === 'PERCENTAGE' ? (applicableAmount * discount.value / 100) : discount.value;
        if (discountAmount > item.netAmount) discountAmount = item.netAmount;
        
        item.discountAmount += discountAmount;
        item.netAmount -= discountAmount;
      } else {
        // Apply to total subtotal
        discountAmount = discount.type === 'PERCENTAGE' ? (invoice.subTotal * discount.value / 100) : discount.value;
        if (discountAmount > invoice.balanceDue) discountAmount = invoice.balanceDue; // Don't exceed balance
      }

      invoice.totalDiscount += discountAmount;
      invoice.grandTotal -= discountAmount;
      invoice.balanceDue -= discountAmount;
      
      if (invoice.balanceDue <= 0) invoice.status = 'PAID';

      await invoice.save({ session });
      
      // Prevent applying the same scholarship discount twice by deactivating or marking it used if it's one-time
      // discount.isActive = false;
      // await discount.save({ session });

      await session.commitTransaction();
      session.endSession();

      return invoice;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
