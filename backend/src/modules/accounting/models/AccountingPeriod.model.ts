import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAccountingPeriod extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g., 'FY2026-27' or 'April 2026'
  startDate: Date;
  endDate: Date;
  isClosed: boolean;
  closedAt?: Date;
  closedBy?: mongoose.Types.ObjectId;
}

const AccountingPeriodSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isClosed: { type: Boolean, default: false },
    closedAt: Date,
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

AccountingPeriodSchema.plugin(softDeletePlugin);

export default (mongoose.models['AccountingPeriod'] || mongoose.model<IAccountingPeriod>('AccountingPeriod', AccountingPeriodSchema)) as any;
