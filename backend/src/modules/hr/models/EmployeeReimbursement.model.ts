import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployeeReimbursement extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  claimDate: Date;
  expenseType: 'TRAVEL' | 'MEDICAL' | 'MEAL' | 'OFFICE_SUPPLIES' | 'OTHER';
  amount: number;
  description: string;
  documentUrl?: string; // Receipt/Invoice
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
  approvedAmount?: number;
  approvedBy?: mongoose.Types.ObjectId;
  approvedDate?: Date;
  rejectionReason?: string;
  payrollPeriodId?: mongoose.Types.ObjectId; // If processed via payroll
}

const EmployeeReimbursementSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  claimDate: { type: Date, required: true },
  expenseType: {
    type: String,
    enum: ['TRAVEL', 'MEDICAL', 'MEAL', 'OFFICE_SUPPLIES', 'OTHER'],
    required: true,
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  documentUrl: String,
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'],
    default: 'DRAFT',
  },
  approvedAmount: Number,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  approvedDate: Date,
  rejectionReason: String,
  payrollPeriodId: { type: Schema.Types.ObjectId, ref: 'PayrollPeriod' },
}, { timestamps: true });

EmployeeReimbursementSchema.plugin(softDeletePlugin);

export default (mongoose.models['EmployeeReimbursement'] || (mongoose.models['EmployeeReimbursement'] || mongoose.model<IEmployeeReimbursement>('EmployeeReimbursement', EmployeeReimbursementSchema)) as any) as any;
