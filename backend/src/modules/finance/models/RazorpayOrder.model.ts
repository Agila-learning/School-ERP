import mongoose, { Document, Schema } from 'mongoose';

export interface IRazorpayOrder extends Document {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  internalPaymentId?: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'ATTEMPTED' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
  createdAt: Date;
}

const RazorpayOrderSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    internalPaymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    razorpayOrderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['CREATED', 'ATTEMPTED', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED'],
      default: 'CREATED',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default (mongoose.models['RazorpayOrder'] || (mongoose.models['RazorpayOrder'] || mongoose.model<IRazorpayOrder>('RazorpayOrder', RazorpayOrderSchema)) as any) as any;
