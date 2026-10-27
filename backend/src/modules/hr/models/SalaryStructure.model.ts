import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISalaryStructure extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  effectiveFrom: Date;
  effectiveTo?: Date; // Null means current active structure
  grossSalaryAnnual: number;
  grossSalaryMonthly: number;
  components: {
    componentId: mongoose.Types.ObjectId;
    amount: number; // Monthly fixed override or calculated baseline
  }[];
  approvedById: mongoose.Types.ObjectId;
  reason?: string; // e.g., 'Annual Increment', 'Promotion'
}

const SalaryStructureSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  effectiveFrom: { type: Date, required: true },
  effectiveTo: Date,
  grossSalaryAnnual: { type: Number, required: true },
  grossSalaryMonthly: { type: Number, required: true },
  components: [{
    componentId: { type: Schema.Types.ObjectId, ref: 'SalaryComponent', required: true },
    amount: { type: Number, required: true },
  }],
  approvedById: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  reason: String,
}, { timestamps: true });

// Avoid multiple active structures starting on same day
SalaryStructureSchema.index({ tenantId: 1, employeeId: 1, effectiveFrom: 1 }, { unique: true });
SalaryStructureSchema.plugin(softDeletePlugin);

export default (mongoose.models['SalaryStructure'] || (mongoose.models['SalaryStructure'] || mongoose.model<ISalaryStructure>('SalaryStructure', SalaryStructureSchema)) as any) as any;
