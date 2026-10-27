import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPayslip extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  payrollPeriodId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  payslipNumber: string;
  // Attendance inputs
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number; // LOP
  // Financials
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  
  components: {
    componentId: mongoose.Types.ObjectId;
    type: 'EARNING' | 'DEDUCTION' | 'STATUTORY';
    name: string;
    amount: number;
  }[];

  status: 'DRAFT' | 'GENERATED' | 'PUBLISHED' | 'PAID' | 'VOID';
  paymentReference?: string;
  paymentDate?: Date;
}

const PayslipSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  payrollPeriodId: { type: Schema.Types.ObjectId, ref: 'PayrollPeriod', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  payslipNumber: { type: String, required: true },
  workingDays: { type: Number, required: true },
  presentDays: { type: Number, required: true },
  paidLeaveDays: { type: Number, required: true },
  unpaidLeaveDays: { type: Number, required: true },
  totalEarnings: { type: Number, required: true },
  totalDeductions: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  components: [{
    componentId: { type: Schema.Types.ObjectId, ref: 'SalaryComponent', required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'GENERATED', 'PUBLISHED', 'PAID', 'VOID'],
    default: 'DRAFT',
  },
  paymentReference: String,
  paymentDate: Date,
}, { timestamps: true });

// Prevent duplicate payslips for same employee in same period
PayslipSchema.index({ tenantId: 1, payrollPeriodId: 1, employeeId: 1 }, { unique: true });
PayslipSchema.plugin(softDeletePlugin);

export default (mongoose.models['Payslip'] || (mongoose.models['Payslip'] || mongoose.model<IPayslip>('Payslip', PayslipSchema)) as any) as any;
