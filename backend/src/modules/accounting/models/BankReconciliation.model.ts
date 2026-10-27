import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IBankReconciliation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  bankAccountId: mongoose.Types.ObjectId; // ChartOfAccount representing the bank
  statementDate: Date;
  statementReference: string;
  description: string;
  amount: number; // positive for deposit, negative for withdrawal
  journalEntryId?: mongoose.Types.ObjectId; // Matched ERP transaction
  status: 'UNMATCHED' | 'MATCHED' | 'RECONCILED' | 'IGNORED';
  reconciledBy?: mongoose.Types.ObjectId;
  reconciledAt?: Date;
}

const BankReconciliationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  bankAccountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
  statementDate: { type: Date, required: true },
  statementReference: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  journalEntryId: { type: Schema.Types.ObjectId, ref: 'JournalEntry' },
  status: { type: String, enum: ['UNMATCHED', 'MATCHED', 'RECONCILED', 'IGNORED'], default: 'UNMATCHED' },
  reconciledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reconciledAt: Date,
}, { timestamps: true });

BankReconciliationSchema.plugin(softDeletePlugin);

export const BankReconciliation = (mongoose.models['BankReconciliation'] || mongoose.model<IBankReconciliation>('BankReconciliation', BankReconciliationSchema)) as any;
