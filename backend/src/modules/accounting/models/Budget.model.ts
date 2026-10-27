import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IBudget extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  financialYearId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId; // ChartOfAccount
  allocatedAmount: number;
  revisedAmount?: number;
  usedAmount: number;
  remainingAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'EXHAUSTED';
  approvedBy?: mongoose.Types.ObjectId;
}

const BudgetSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  financialYearId: { type: Schema.Types.ObjectId, ref: 'FinancialYear', required: true },
  departmentId: { type: Schema.Types.ObjectId },
  accountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
  allocatedAmount: { type: Number, required: true },
  revisedAmount: { type: Number },
  usedAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, required: true },
  status: { type: String, enum: ['DRAFT', 'APPROVED', 'EXHAUSTED'], default: 'DRAFT' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

BudgetSchema.plugin(softDeletePlugin);

// Pre-save middleware to calculate remainingAmount
BudgetSchema.pre<IBudget>('save', function (next: any) {
  const totalAllocated = this.revisedAmount !== undefined ? this.revisedAmount : this.allocatedAmount;
  this.remainingAmount = totalAllocated - this.usedAmount;
  if (this.remainingAmount <= 0 && this.status === 'APPROVED') {
    this.status = 'EXHAUSTED';
  }
  next();
});

export const Budget = (mongoose.models['Budget'] || mongoose.model<IBudget>('Budget', BudgetSchema)) as any;
