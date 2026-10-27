import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployeeStatutoryProfile extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  panNumber?: string;
  aadhaarReference?: string;
  pfUan?: string;
  esiNumber?: string;
  professionalTaxId?: string;
  taxRegime?: string;
  lastUpdatedBy?: mongoose.Types.ObjectId;
}

const EmployeeStatutoryProfileSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    panNumber: String,
    aadhaarReference: String,
    pfUan: String,
    esiNumber: String,
    professionalTaxId: String,
    taxRegime: String,
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

EmployeeStatutoryProfileSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });
EmployeeStatutoryProfileSchema.plugin(softDeletePlugin);

export default (mongoose.models['EmployeeStatutoryProfile'] || (mongoose.models['EmployeeStatutoryProfile'] || mongoose.model<IEmployeeStatutoryProfile>('EmployeeStatutoryProfile', EmployeeStatutoryProfileSchema)) as any) as any;
