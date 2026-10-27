import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IBankAccount extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  bankName: string;
  accountName: string;
  maskedAccountNumber: string;
  ifsc?: string;
  openingBalance: number;
  currentBalance: number;
  currency: string;
  isActive: boolean;
  linkedAccountId: mongoose.Types.ObjectId; // Link to ChartOfAccount
}

const BankAccountSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    maskedAccountNumber: { type: String, required: true },
    ifsc: String,
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    isActive: { type: Boolean, default: true },
    linkedAccountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
  },
  { timestamps: true }
);

BankAccountSchema.plugin(softDeletePlugin);

export default (mongoose.models['BankAccount'] || mongoose.model<IBankAccount>('BankAccount', BankAccountSchema)) as any;
