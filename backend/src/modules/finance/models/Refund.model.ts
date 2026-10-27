import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IRefund extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED';
  requestedByUserId: mongoose.Types.ObjectId;
  approvedByUserId?: mongoose.Types.ObjectId;
  processedAt?: Date;
  refundMethod?: string;
  referenceNumber?: string;
}

const RefundSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED'],
      default: 'REQUESTED'
    },
    requestedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,
    refundMethod: String,
    referenceNumber: String,
  },
  { timestamps: true }
);

RefundSchema.plugin(softDeletePlugin);

export default (mongoose.models['Refund'] || mongoose.model<IRefund>('Refund', RefundSchema)) as any;
