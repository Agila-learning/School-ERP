import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export interface IChartOfAccount extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  parentAccountId?: mongoose.Types.ObjectId | IChartOfAccount;
  description?: string;
  isSystemAccount: boolean;
  systemCode?: string; // e.g. 'CASH', 'BANK', 'STUDENT_RECEIVABLE', 'FEE_INCOME'
  isActive: boolean;
}

const ChartOfAccountSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    accountCode: { type: String, required: true },
    accountName: { type: String, required: true },
    accountType: {
      type: String,
      enum: ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'],
      required: true,
      index: true,
    },
    parentAccountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount' },
    description: { type: String },
    isSystemAccount: { type: Boolean, default: false },
    systemCode: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ChartOfAccountSchema.index({ tenantId: 1, accountCode: 1 }, { unique: true });
ChartOfAccountSchema.plugin(softDeletePlugin);

export default (mongoose.models['ChartOfAccount'] || mongoose.model<IChartOfAccount>('ChartOfAccount', ChartOfAccountSchema)) as any;
