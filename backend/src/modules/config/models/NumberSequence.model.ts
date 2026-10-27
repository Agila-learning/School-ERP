import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface INumberSequence extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  type: string; // e.g. 'ADMISSION_NUMBER', 'INVOICE_NUMBER', 'EMPLOYEE_ID'
  prefix?: string; // e.g. 'STU', 'INV'
  suffix?: string;
  currentNumber: number;
  padding: number; // e.g. 6 -> 000001
  includeYear: boolean;
  includeBranchCode: boolean;
  resetPolicy: 'NEVER' | 'YEARLY' | 'MONTHLY';
}

const NumberSequenceSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, required: true },
    prefix: String,
    suffix: String,
    currentNumber: { type: Number, default: 0 },
    padding: { type: Number, default: 6 },
    includeYear: { type: Boolean, default: false },
    includeBranchCode: { type: Boolean, default: false },
    resetPolicy: {
      type: String,
      enum: ['NEVER', 'YEARLY', 'MONTHLY'],
      default: 'NEVER',
    },
  },
  {
    timestamps: true,
  }
);

NumberSequenceSchema.index({ tenantId: 1, type: 1 }, { unique: true });
NumberSequenceSchema.plugin(softDeletePlugin);

export default (mongoose.models['NumberSequence'] || (mongoose.models['NumberSequence'] || mongoose.model<INumberSequence>('NumberSequence', NumberSequenceSchema)) as any) as any;
