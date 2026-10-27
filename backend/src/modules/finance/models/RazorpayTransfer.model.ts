import mongoose, { Document, Schema } from 'mongoose';

export interface IRazorpayTransfer extends Document {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  razorpayTransferId: string; // trf_XYZ
  razorpayPaymentId: string; // Source payment
  linkedAccountId: string; // Destination acc_XYZ
  amount: number;
  currency: string;
  status: 'PROCESSED' | 'FAILED' | 'REVERSED';
  reversalId?: string; // if reversed
  createdAt: Date;
}

const RazorpayTransferSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    razorpayTransferId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, required: true, index: true },
    linkedAccountId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['PROCESSED', 'FAILED', 'REVERSED'], default: 'PROCESSED' },
    reversalId: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default (mongoose.models['RazorpayTransfer'] || mongoose.model<IRazorpayTransfer>('RazorpayTransfer', RazorpayTransferSchema)) as any;
