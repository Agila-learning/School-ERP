import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployeeExperience extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  organization: string;
  designation: string;
  startDate: Date;
  endDate?: Date;
  yearsOfExperience: number;
  responsibilities?: string;
}

const EmployeeExperienceSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    organization: { type: String, required: true },
    designation: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    yearsOfExperience: { type: Number, required: true },
    responsibilities: String,
  },
  {
    timestamps: true,
  }
);

EmployeeExperienceSchema.plugin(softDeletePlugin);

export default (mongoose.models['EmployeeExperience'] || (mongoose.models['EmployeeExperience'] || mongoose.model<IEmployeeExperience>('EmployeeExperience', EmployeeExperienceSchema)) as any) as any;
