import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IReceipt extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  receiptNumber: string; // e.g. REC-2026-0001
  paymentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  totalAmount: number;
  paymentMethod: string;
  issuedAt: Date;
}

const ReceiptSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    receiptNumber: { type: String, required: true, unique: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReceiptSchema.index({ tenantId: 1, receiptNumber: 1 }, { unique: true });
ReceiptSchema.plugin(softDeletePlugin);

export default (mongoose.models['Receipt'] || (mongoose.models['Receipt'] || mongoose.model<IReceipt>('Receipt', ReceiptSchema)) as any) as any;
