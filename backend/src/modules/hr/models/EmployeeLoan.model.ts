import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployeeLoan extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  loanType: 'ADVANCE_SALARY' | 'PERSONAL_LOAN' | 'MEDICAL_EMERGENCY' | 'OTHER';
  principalAmount: number;
  interestRatePercentage: number;
  totalRepaymentAmount: number;
  emiAmount: number;
  disbursementDate: Date;
  deductionStartDate: Date; // Links to payroll period
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISBURSED' | 'REPAYING' | 'CLOSED' | 'DEFAULTED';
  repaidAmount: number;
  approvedById?: mongoose.Types.ObjectId;
}

const EmployeeLoanSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  loanType: {
    type: String,
    enum: ['ADVANCE_SALARY', 'PERSONAL_LOAN', 'MEDICAL_EMERGENCY', 'OTHER'],
    required: true,
  },
  principalAmount: { type: Number, required: true },
  interestRatePercentage: { type: Number, default: 0 },
  totalRepaymentAmount: { type: Number, required: true },
  emiAmount: { type: Number, required: true },
  disbursementDate: Date,
  deductionStartDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'DISBURSED', 'REPAYING', 'CLOSED', 'DEFAULTED'],
    default: 'PENDING_APPROVAL',
  },
  repaidAmount: { type: Number, default: 0 },
  approvedById: { type: Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

EmployeeLoanSchema.plugin(softDeletePlugin);

export default (mongoose.models['EmployeeLoan'] || (mongoose.models['EmployeeLoan'] || mongoose.model<IEmployeeLoan>('EmployeeLoan', EmployeeLoanSchema)) as any) as any;
