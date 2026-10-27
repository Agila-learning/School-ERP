import mongoose, { Document, Schema } from 'mongoose';

export interface IReconciliationRecord extends Document {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  razorpayPaymentId: string;
  razorpaySettlementId?: string;
  internalPaymentId?: mongoose.Types.ObjectId;
  matchStatus: 'MATCHED' | 'PARTIALLY_MATCHED' | 'UNMATCHED' | 'EXCEPTION';
  amountGateway: number;
  amountInternal: number;
  notes?: string;
  createdAt: Date;
}

const ReconciliationRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    razorpayPaymentId: { type: String, required: true, unique: true },
    razorpaySettlementId: String,
    internalPaymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    matchStatus: {
      type: String,
      enum: ['MATCHED', 'PARTIALLY_MATCHED', 'UNMATCHED', 'EXCEPTION'],
      required: true,
    },
    amountGateway: { type: Number, required: true },
    amountInternal: { type: Number, required: true },
    notes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default (mongoose.models['ReconciliationRecord'] || mongoose.model<IReconciliationRecord>('ReconciliationRecord', ReconciliationRecordSchema)) as any;
