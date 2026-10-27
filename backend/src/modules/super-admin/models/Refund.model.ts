import mongoose, { Document, Schema } from 'mongoose';

export interface ISaasRefund extends Document {
  tenantId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  refundAmount: number;
  currency: string;
  reason: string;
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  providerRefundId?: string;
  notes?: string;
  rejectionReason?: string;
  processedAt?: Date;
}

const SaasRefundSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'SaasPayment', required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'SaasInvoice' },
    refundAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    reason: { type: String, required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED'],
      default: 'REQUESTED',
    },
    providerRefundId: String,
    notes: String,
    rejectionReason: String,
    processedAt: Date,
  },
  { timestamps: true }
);

export default (mongoose.models['SaasRefund'] || mongoose.model<ISaasRefund>('SaasRefund', SaasRefundSchema)) as any;
