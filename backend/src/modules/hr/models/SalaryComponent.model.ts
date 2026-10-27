import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISalaryComponent extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  code: string;
  name: string; // e.g., Basic, HRA, PF, TDS
  type: 'EARNING' | 'DEDUCTION' | 'STATUTORY';
  calculationMethod: 'FIXED' | 'PERCENTAGE_OF_BASIC' | 'PERCENTAGE_OF_GROSS' | 'FORMULA';
  formula?: string; // If FORMULA is used, controlled engine will parse this
  isTaxable: boolean;
  isStatutory: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

const SalaryComponentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['EARNING', 'DEDUCTION', 'STATUTORY'], required: true },
  calculationMethod: {
    type: String,
    enum: ['FIXED', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'FORMULA'],
    required: true,
  },
  formula: String,
  isTaxable: { type: Boolean, default: false },
  isStatutory: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

SalaryComponentSchema.index({ tenantId: 1, code: 1 }, { unique: true });
SalaryComponentSchema.plugin(softDeletePlugin);

export default (mongoose.models['SalaryComponent'] || (mongoose.models['SalaryComponent'] || mongoose.model<ISalaryComponent>('SalaryComponent', SalaryComponentSchema)) as any) as any;
