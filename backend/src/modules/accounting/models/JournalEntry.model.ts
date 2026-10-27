import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IJournalEntryLine {
  accountId: mongoose.Types.ObjectId;
  debit: number;
  credit: number;
  description?: string;
  costCenterId?: mongoose.Types.ObjectId;
}

export interface IJournalEntry extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  journalNumber: string;
  date: Date;
  financialPeriodId: mongoose.Types.ObjectId;
  description: string;
  lines: IJournalEntryLine[];
  sourceType?: string; // 'INVOICE', 'PAYMENT', 'MANUAL', 'ADJUSTMENT'
  sourceId?: string; // e.g. Payment ID for idempotency mapping
  totalDebit: number;
  totalCredit: number;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
  postedBy?: mongoose.Types.ObjectId;
  postedAt?: Date;
}

const JournalEntryLineSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
  debit: { type: Number, required: true, default: 0 },
  credit: { type: Number, required: true, default: 0 },
  description: String,
  costCenterId: { type: Schema.Types.ObjectId },
}, { _id: false });

const JournalEntrySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    journalNumber: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    financialPeriodId: { type: Schema.Types.ObjectId, ref: 'FinancialPeriod', required: true, index: true },
    description: { type: String, required: true },
    lines: [JournalEntryLineSchema],
    sourceType: { type: String, index: true },
    sourceId: { type: String, index: true },
    totalDebit: { type: Number, required: true },
    totalCredit: { type: Number, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'POSTED', 'REVERSED'],
      default: 'DRAFT',
    },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    postedAt: Date,
  },
  { timestamps: true }
);

JournalEntrySchema.index({ tenantId: 1, journalNumber: 1 }, { unique: true });
JournalEntrySchema.index({ tenantId: 1, sourceType: 1, sourceId: 1 }, { unique: true, sparse: true }); // Idempotency
JournalEntrySchema.plugin(softDeletePlugin);

export default (mongoose.models['JournalEntry'] || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema)) as any;
