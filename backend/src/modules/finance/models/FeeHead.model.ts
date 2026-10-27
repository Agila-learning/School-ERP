import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IFeeHead extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g., Tuition, Transport, Lab
  code: string; // e.g., TUI, TRA, LAB
  description?: string;
  category: 'ACADEMIC' | 'TRANSPORT' | 'HOSTEL' | 'MISCELLANEOUS';
  isTaxable: boolean;
  isRefundable: boolean;
  isActive: boolean;
  accountingLedgerReference?: string; // Links to future accounting module
}

const FeeHeadSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ['ACADEMIC', 'TRANSPORT', 'HOSTEL', 'MISCELLANEOUS'],
      required: true,
    },
    isTaxable: { type: Boolean, default: false },
    isRefundable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    accountingLedgerReference: String,
  },
  { timestamps: true }
);

FeeHeadSchema.index({ tenantId: 1, code: 1 }, { unique: true });
FeeHeadSchema.plugin(softDeletePlugin);

export default (mongoose.models['FeeHead'] || (mongoose.models['FeeHead'] || mongoose.model<IFeeHead>('FeeHead', FeeHeadSchema)) as any) as any;
