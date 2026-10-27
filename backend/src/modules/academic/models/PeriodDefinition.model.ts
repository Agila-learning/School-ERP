import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPeriodDefinition extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  name: string; // e.g., 'Period 1', 'Lunch Break'
  number: number;
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '09:45'
  durationMinutes: number;
  isBreak: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

const PeriodDefinitionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    name: { type: String, required: true },
    number: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    isBreak: { type: Boolean, default: false },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

PeriodDefinitionSchema.index({ tenantId: 1, branchId: 1, academicYearId: 1, number: 1 }, { unique: true });
PeriodDefinitionSchema.plugin(softDeletePlugin);

export default (mongoose.models['PeriodDefinition'] || (mongoose.models['PeriodDefinition'] || mongoose.model<IPeriodDefinition>('PeriodDefinition', PeriodDefinitionSchema)) as any) as any;
