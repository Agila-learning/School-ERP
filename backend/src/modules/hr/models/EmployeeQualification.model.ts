import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployeeQualification extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  degree: string;
  institution: string;
  university?: string;
  specialization?: string;
  startYear?: number;
  completionYear: number;
  gradeOrPercentage?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

const EmployeeQualificationSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    university: String,
    specialization: String,
    startYear: Number,
    completionYear: { type: Number, required: true },
    gradeOrPercentage: String,
    verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
  },
  {
    timestamps: true,
  }
);

EmployeeQualificationSchema.plugin(softDeletePlugin);

export default (mongoose.models['EmployeeQualification'] || (mongoose.models['EmployeeQualification'] || mongoose.model<IEmployeeQualification>('EmployeeQualification', EmployeeQualificationSchema)) as any) as any;
