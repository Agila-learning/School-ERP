import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITaxConfiguration extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  taxName: string; // e.g. VAT, GST
  taxType: 'PERCENTAGE' | 'FIXED';
  rate: number;
  accountId: mongoose.Types.ObjectId; // ChartOfAccount to post tax to
  effectiveDate: Date;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ITaxTransaction extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  taxConfigId: mongoose.Types.ObjectId;
  journalEntryId: mongoose.Types.ObjectId;
  taxableAmount: number;
  taxAmount: number;
  date: Date;
}

const TaxConfigurationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  taxName: { type: String, required: true },
  taxType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
  rate: { type: Number, required: true },
  accountId: { type: Schema.Types.ObjectId, ref: 'ChartOfAccount', required: true },
  effectiveDate: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

const TaxTransactionSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  taxConfigId: { type: Schema.Types.ObjectId, ref: 'TaxConfiguration', required: true },
  journalEntryId: { type: Schema.Types.ObjectId, ref: 'JournalEntry', required: true },
  taxableAmount: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

[TaxConfigurationSchema, TaxTransactionSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const TaxConfiguration = (mongoose.models['TaxConfiguration'] || mongoose.model<ITaxConfiguration>('TaxConfiguration', TaxConfigurationSchema)) as any;
export const TaxTransaction = (mongoose.models['TaxTransaction'] || mongoose.model<ITaxTransaction>('TaxTransaction', TaxTransactionSchema)) as any;
