import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IResignation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  resignationDate: Date;
  proposedLastWorkingDate: Date;
  reason: string;
  reasonCategory?: string;
  handoverNotes?: string;
  noticePeriodRequiredDays: number;
  approvedLastWorkingDate?: Date;
  status: 'SUBMITTED' | 'PENDING_PRINCIPAL' | 'PRINCIPAL_APPROVED' | 'PENDING_HR' | 'HR_APPROVED' | 'PENDING_ADMIN' | 'FINAL_APPROVED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  principalApproval?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    comments?: string;
    approvedLWD?: Date;
  };
  hrApproval?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    comments?: string;
  };
  adminApproval?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    comments?: string;
    deactivationDate?: Date;
  };
}

export interface IExitClearance extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  resignationId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  department: 'HR' | 'FINANCE' | 'IT' | 'LIBRARY' | 'ADMIN';
  cleared: boolean;
  clearedById?: mongoose.Types.ObjectId;
  clearedDate?: Date;
  remarks?: string;
  pendingDeductionAmount: number; // e.g. Library fine, lost laptop charge
}

export interface IFinalSettlement extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  resignationId: mongoose.Types.ObjectId;
  // Earnings
  finalSalaryAmount: number;
  leaveEncashmentAmount: number;
  pendingReimbursements: number;
  // Deductions
  noticePeriodRecovery: number;
  loanRecovery: number;
  clearanceDeductions: number; // Sum from ExitClearances
  // Totals
  netSettlementAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  paymentReference?: string;
  settlementDate?: Date;
}

const ResignationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  resignationDate: { type: Date, required: true },
  proposedLastWorkingDate: { type: Date, required: true },
  reason: { type: String, required: true },
  reasonCategory: { type: String, default: 'CAREER_GROWTH' },
  handoverNotes: { type: String, default: '' },
  noticePeriodRequiredDays: { type: Number, required: true },
  approvedLastWorkingDate: Date,
  status: {
    type: String,
    enum: [
      'SUBMITTED', 'PENDING_PRINCIPAL', 'PRINCIPAL_APPROVED',
      'PENDING_HR', 'HR_APPROVED', 'PENDING_ADMIN',
      'FINAL_APPROVED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'
    ],
    default: 'PENDING_PRINCIPAL',
  },
  principalApproval: {
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    comments: { type: String, default: '' },
    approvedLWD: Date
  },
  hrApproval: {
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    comments: { type: String, default: '' }
  },
  adminApproval: {
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    comments: { type: String, default: '' },
    deactivationDate: Date
  }
}, { timestamps: true });

const ExitClearanceSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  resignationId: { type: Schema.Types.ObjectId, ref: 'Resignation', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  department: {
    type: String,
    enum: ['HR', 'FINANCE', 'IT', 'LIBRARY', 'ADMIN'],
    required: true,
  },
  cleared: { type: Boolean, default: false },
  clearedById: { type: Schema.Types.ObjectId, ref: 'Employee' },
  clearedDate: Date,
  remarks: String,
  pendingDeductionAmount: { type: Number, default: 0 },
}, { timestamps: true });
ExitClearanceSchema.index({ tenantId: 1, resignationId: 1, department: 1 }, { unique: true });

const FinalSettlementSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  resignationId: { type: Schema.Types.ObjectId, ref: 'Resignation', required: true, unique: true },
  finalSalaryAmount: { type: Number, default: 0 },
  leaveEncashmentAmount: { type: Number, default: 0 },
  pendingReimbursements: { type: Number, default: 0 },
  noticePeriodRecovery: { type: Number, default: 0 },
  loanRecovery: { type: Number, default: 0 },
  clearanceDeductions: { type: Number, default: 0 },
  netSettlementAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'PAID'],
    default: 'DRAFT',
  },
  paymentReference: String,
  settlementDate: Date,
}, { timestamps: true });

ResignationSchema.plugin(softDeletePlugin);
ExitClearanceSchema.plugin(softDeletePlugin);
FinalSettlementSchema.plugin(softDeletePlugin);

export const Resignation = (mongoose.models['Resignation'] || mongoose.model<IResignation>('Resignation', ResignationSchema)) as any;
export const ExitClearance = (mongoose.models['ExitClearance'] || mongoose.model<IExitClearance>('ExitClearance', ExitClearanceSchema)) as any;
export const FinalSettlement = (mongoose.models['FinalSettlement'] || mongoose.model<IFinalSettlement>('FinalSettlement', FinalSettlementSchema)) as any;
