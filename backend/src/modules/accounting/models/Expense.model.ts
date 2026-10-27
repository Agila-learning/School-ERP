import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IExpense extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  taxAmount: number;
  netAmount: number;
  date: Date;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  paymentMethod?: string;
  referenceNumber?: string;
  approvedBy?: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
}

const ExpenseSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' }, // Reusing Phase 41 vendor if exists, else soft ref
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'PAID', 'REJECTED'],
      default: 'PENDING',
    },
    paymentMethod: String,
    referenceNumber: String,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ExpenseSchema.plugin(softDeletePlugin);

export default (mongoose.models['Expense'] || mongoose.model<IExpense>('Expense', ExpenseSchema)) as any;
