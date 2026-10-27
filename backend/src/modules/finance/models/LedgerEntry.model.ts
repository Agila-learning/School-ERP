import mongoose, { Document, Schema } from 'mongoose';

export interface ILedgerEntry extends Document {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  transactionDate: Date;
  referenceId: mongoose.Types.ObjectId; // Invoice, Payment, or Refund ID
  referenceType: 'INVOICE' | 'PAYMENT' | 'REFUND' | 'ADJUSTMENT';
  account: 'CASH' | 'BANK' | 'RAZORPAY_CLEARING' | 'ACCOUNTS_RECEIVABLE' | 'FEE_REVENUE' | 'DISCOUNT_EXPENSE';
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
}

const LedgerEntrySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    transactionDate: { type: Date, default: Date.now },
    referenceId: { type: Schema.Types.ObjectId, required: true },
    referenceType: {
      type: String,
      enum: ['INVOICE', 'PAYMENT', 'REFUND', 'ADJUSTMENT'],
      required: true,
    },
    account: {
      type: String,
      enum: ['CASH', 'BANK', 'RAZORPAY_CLEARING', 'ACCOUNTS_RECEIVABLE', 'FEE_REVENUE', 'DISCOUNT_EXPENSE'],
      required: true,
    },
    type: { type: String, enum: ['DEBIT', 'CREDIT'], required: true },
    amount: { type: Number, required: true },
    description: String,
  },
  { timestamps: true }
);

LedgerEntrySchema.index({ tenantId: 1, referenceId: 1, referenceType: 1 });

export default (mongoose.models['LedgerEntry'] || (mongoose.models['LedgerEntry'] || mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema)) as any) as any;
