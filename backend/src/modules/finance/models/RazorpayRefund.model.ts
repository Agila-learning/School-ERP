import mongoose, { Document, Schema } from 'mongoose';

export interface IRazorpayRefund extends Document {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  internalPaymentId: mongoose.Types.ObjectId;
  razorpayPaymentId: string;
  razorpayRefundId?: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RazorpayRefundSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    internalPaymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    razorpayPaymentId: { type: String, required: true },
    razorpayRefundId: { type: String, sparse: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    reason: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'PROCESSED', 'FAILED'], default: 'PENDING' },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default (mongoose.models['RazorpayRefund'] || mongoose.model<IRazorpayRefund>('RazorpayRefund', RazorpayRefundSchema)) as any;
