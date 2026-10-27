import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostel extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  hostelType: string; // Configurable: 'BOYS', 'GIRLS', 'MIXED', 'STAFF', 'GUEST', 'OTHER'
  genderApplicability: 'MALE' | 'FEMALE' | 'MIXED';
  totalCapacity: number;
  address?: string;
  contactNumber?: string;
  wardenId?: mongoose.Types.ObjectId;    // Ref: Employee
  assistantWardenId?: mongoose.Types.ObjectId; // Ref: Employee
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  description?: string;
  rules?: string;
}

const HostelSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', default: () => new mongoose.Types.ObjectId() },
  campusId: { type: Schema.Types.ObjectId, ref: 'Campus' },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', default: () => new mongoose.Types.ObjectId() },
  code: { type: String, required: true },
  name: { type: String, required: true },
  hostelType: { type: String, default: 'BOYS' },
  genderApplicability: { type: String, enum: ['MALE', 'FEMALE', 'MIXED'], default: 'MIXED' },
  totalCapacity: { type: Number, required: true, default: 100 },
  address: String,
  contactNumber: String,
  wardenId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  assistantWardenId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'], default: 'ACTIVE' },
  description: String,
  rules: String,
}, { timestamps: true });

HostelSchema.index({ tenantId: 1, code: 1 }, { unique: true });
HostelSchema.plugin(softDeletePlugin);
export default (mongoose.models['Hostel'] || (mongoose.models['Hostel'] || mongoose.model<IHostel>('Hostel', HostelSchema)) as any) as any;
