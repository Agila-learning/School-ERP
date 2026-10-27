import mongoose, { Document, Schema } from 'mongoose';

export interface ISaasPayment extends Document {
  tenantId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod?: string;
  provider?: string;
  providerTransactionId?: string;
  providerOrderId?: string;
  paymentDate?: Date;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  failureReason?: string;
  failureCode?: string;
  metadata?: Record<string, any>;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  refundedAmount?: number;
}

const SaasPaymentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'SaasInvoice' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentMethod: { type: String, default: 'MANUAL' },
    provider: { type: String, default: 'MANUAL' },
    providerTransactionId: { type: String, sparse: true },
    providerOrderId: String,
    paymentDate: Date,
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
    },
    failureReason: String,
    failureCode: String,
    metadata: { type: Schema.Types.Mixed },
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    refundedAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SaasPaymentSchema.index({ status: 1 });
SaasPaymentSchema.index({ paymentDate: -1 });

export default (mongoose.models['SaasPayment'] || mongoose.model<ISaasPayment>('SaasPayment', SaasPaymentSchema)) as any;
