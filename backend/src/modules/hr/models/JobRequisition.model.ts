import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IJobRequisition extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  requisitionNumber: string;
  departmentId: mongoose.Types.ObjectId;
  designationId: mongoose.Types.ObjectId;
  numberOfVacancies: number;
  employmentType: 'Permanent' | 'Contract' | 'Part-time' | 'Intern' | 'Visiting Faculty';
  requiredQualifications: string[];
  requiredExperienceYears: number;
  salaryRange: { min: number; max: number };
  jobDescription: string;
  requestedById: mongoose.Types.ObjectId; // Ref Employee
  approvedById?: mongoose.Types.ObjectId; // Ref Employee
  openingDate?: Date;
  closingDate?: Date;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'OPEN' | 'ON_HOLD' | 'CLOSED' | 'CANCELLED';
}

const JobRequisitionSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  requisitionNumber: { type: String, required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  designationId: { type: Schema.Types.ObjectId, ref: 'Designation', required: true },
  numberOfVacancies: { type: Number, required: true },
  employmentType: {
    type: String,
    enum: ['Permanent', 'Contract', 'Part-time', 'Intern', 'Visiting Faculty'],
    required: true,
  },
  requiredQualifications: [String],
  requiredExperienceYears: Number,
  salaryRange: {
    min: Number,
    max: Number,
  },
  jobDescription: { type: String, required: true },
  requestedById: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  approvedById: { type: Schema.Types.ObjectId, ref: 'Employee' },
  openingDate: Date,
  closingDate: Date,
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'OPEN', 'ON_HOLD', 'CLOSED', 'CANCELLED'],
    default: 'DRAFT',
  },
}, { timestamps: true });

JobRequisitionSchema.index({ tenantId: 1, requisitionNumber: 1 }, { unique: true });
JobRequisitionSchema.plugin(softDeletePlugin);

export default (mongoose.models['JobRequisition'] || (mongoose.models['JobRequisition'] || mongoose.model<IJobRequisition>('JobRequisition', JobRequisitionSchema)) as any) as any;
