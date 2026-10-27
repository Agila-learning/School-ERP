import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface IInvoiceItem {
  feeDemandId?: mongoose.Types.ObjectId;
  feeHeadId: mongoose.Types.ObjectId;
  amount: number;
  discountAmount: number;
  concessionAmount: number;
  scholarshipAmount: number;
  taxAmount: number;
  netAmount: number;
}

export interface IInvoice extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  invoiceNumber: string; // E.g., INV-2026-0001
  items: IInvoiceItem[];
  subTotal: number;
  totalDiscount: number;
  totalConcession: number;
  totalScholarship: number;
  totalTax: number;
  totalLateFee: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: Date;
  status: InvoiceStatus;
  issuedAt?: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    items: [
      {
        feeDemandId: { type: Schema.Types.ObjectId, ref: 'FeeDemand' },
        feeHeadId: { type: Schema.Types.ObjectId, ref: 'FeeHead', required: true },
        amount: { type: Number, required: true },
        discountAmount: { type: Number, default: 0 },
        concessionAmount: { type: Number, default: 0 },
        scholarshipAmount: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        netAmount: { type: Number, required: true },
      },
    ],
    subTotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    totalConcession: { type: Number, default: 0 },
    totalScholarship: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    totalLateFee: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'],
      default: 'DRAFT',
    },
    issuedAt: Date,
  },
  { timestamps: true }
);

InvoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.plugin(softDeletePlugin);

export default (mongoose.models['Invoice'] || (mongoose.models['Invoice'] || mongoose.model<IInvoice>('Invoice', InvoiceSchema)) as any) as any;
