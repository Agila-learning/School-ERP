import mongoose, { Document, Schema } from 'mongoose';

export interface IRazorpaySettlement extends Document {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  razorpaySettlementId: string;
  amount: number; // Gross amount
  fees: number;
  tax: number;
  netAmount: number; // Actually settled
  status: string; // processed, created, failed
  settledOn?: Date;
  utr?: string; // UTR reference from bank
  createdAt: Date;
}

const RazorpaySettlementSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    razorpaySettlementId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    fees: { type: Number, required: true },
    tax: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    status: { type: String, required: true },
    settledOn: Date,
    utr: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default (mongoose.models['RazorpaySettlement'] || mongoose.model<IRazorpaySettlement>('RazorpaySettlement', RazorpaySettlementSchema)) as any;
