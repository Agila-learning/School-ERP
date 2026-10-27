import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPayrollPeriod extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number;
  totalWorkingDays: number;
  status: 'DRAFT' | 'PROCESSING' | 'REVIEW' | 'APPROVED' | 'LOCKED' | 'CANCELLED';
  processedAt?: Date;
  processedById?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  approvedById?: mongoose.Types.ObjectId;
}

const PayrollPeriodSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  totalWorkingDays: { type: Number, required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'PROCESSING', 'REVIEW', 'APPROVED', 'LOCKED', 'CANCELLED'],
    default: 'DRAFT',
  },
  processedAt: Date,
  processedById: { type: Schema.Types.ObjectId, ref: 'Employee' },
  approvedAt: Date,
  approvedById: { type: Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

PayrollPeriodSchema.index({ tenantId: 1, month: 1, year: 1, branchId: 1 }, { unique: true });
PayrollPeriodSchema.plugin(softDeletePlugin);

export default (mongoose.models['PayrollPeriod'] || (mongoose.models['PayrollPeriod'] || mongoose.model<IPayrollPeriod>('PayrollPeriod', PayrollPeriodSchema)) as any) as any;
