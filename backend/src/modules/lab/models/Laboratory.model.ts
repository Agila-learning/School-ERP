import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILaboratory extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  labType: string; // 'COMPUTER', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'ROBOTICS', etc.
  capacity: number;
  location?: string;
  inChargeId?: mongoose.Types.ObjectId; // Ref: Employee
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  safetyGuidelines?: string;
}

const LaboratorySchema: Schema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  branchId: { type: Schema.Types.Mixed },
  academicYearId: { type: Schema.Types.Mixed },
  code: { type: String, required: true },
  name: { type: String, required: true },
  labType: { type: String, required: true },
  capacity: { type: Number, required: true, default: 30 },
  location: String,
  inChargeId: { type: Schema.Types.Mixed, ref: 'Employee' },
  inChargeName: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'], default: 'ACTIVE' },
  safetyGuidelines: String,
}, { timestamps: true });

LaboratorySchema.index({ tenantId: 1, code: 1 });
LaboratorySchema.plugin(softDeletePlugin);
export default (mongoose.models['Laboratory'] || mongoose.model<ILaboratory>('Laboratory', LaboratorySchema)) as any;
