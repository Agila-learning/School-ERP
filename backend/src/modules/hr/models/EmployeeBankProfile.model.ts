import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployeeBankProfile extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  bankName: string;
  accountHolderName: string;
  accountNumber: string; // Should be encrypted at application level eventually
  ifscCode?: string;
  branch?: string;
  paymentMethod: string;
  lastUpdatedBy?: mongoose.Types.ObjectId;
}

const EmployeeBankProfileSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: String,
    branch: String,
    paymentMethod: { type: String, default: 'Bank Transfer' },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

EmployeeBankProfileSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });
EmployeeBankProfileSchema.plugin(softDeletePlugin);

export default (mongoose.models['EmployeeBankProfile'] || (mongoose.models['EmployeeBankProfile'] || mongoose.model<IEmployeeBankProfile>('EmployeeBankProfile', EmployeeBankProfileSchema)) as any) as any;
