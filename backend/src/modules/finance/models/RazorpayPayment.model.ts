import mongoose, { Document, Schema } from 'mongoose';

export interface IRazorpayPayment extends Document {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  method: string;
  status: string; // authorized, captured, failed
  email?: string;
  contact?: string;
  vpa?: string; // UPI ID
  cardNetwork?: string;
  fee?: number; // Gateway fee charged
  tax?: number; // Gateway tax charged
  captured: boolean;
  errorDescription?: string;
  createdAt: Date;
}

const RazorpayPaymentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    razorpayPaymentId: { type: String, required: true, unique: true },
    razorpayOrderId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String },
    status: { type: String },
    email: String,
    contact: String,
    vpa: String,
    cardNetwork: String,
    fee: Number,
    tax: Number,
    captured: { type: Boolean, default: false },
    errorDescription: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default (mongoose.models['RazorpayPayment'] || mongoose.model<IRazorpayPayment>('RazorpayPayment', RazorpayPaymentSchema)) as any;
