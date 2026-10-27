import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  tenantId: mongoose.Types.ObjectId;
  entity: string; // e.g. "INVOICE", "RECEIPT"
  prefix: string; // e.g. "INV-2026-", "REC-2026-"
  sequence_value: number;
}

const counterSchema = new Schema<ICounter>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  entity: { type: String, required: true },
  prefix: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

// Ensure uniqueness across tenant, entity, and prefix
counterSchema.index({ tenantId: 1, entity: 1, prefix: 1 }, { unique: true });

export default mongoose.model<ICounter>('FinanceCounter', counterSchema);
