import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type LibraryFineType = 'OVERDUE' | 'LOST_BOOK' | 'DAMAGED_BOOK' | 'LATE_RETURN' | 'OTHER';

export interface ILibraryFine extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Member
  issueId?: mongoose.Types.ObjectId; // Original Issue context
  copyId: mongoose.Types.ObjectId;
  fineType: LibraryFineType;
  description: string;
  amount: number;
  waivedAmount: number;
  netAmount: number;
  feeDemandId?: mongoose.Types.ObjectId; // Reference to Finance module FeeDemand
  invoiceId?: mongoose.Types.ObjectId; // Reference to Finance module Invoice
  paymentId?: mongoose.Types.ObjectId; // Reference to Finance module Payment
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED' | 'CANCELLED';
  waivedByUserId?: mongoose.Types.ObjectId;
  waiveReason?: string;
}

const LibraryFineSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  issueId: { type: Schema.Types.ObjectId, ref: 'BookIssue' },
  copyId: { type: Schema.Types.ObjectId, ref: 'BookCopy', required: true },
  fineType: {
    type: String,
    enum: ['OVERDUE', 'LOST_BOOK', 'DAMAGED_BOOK', 'LATE_RETURN', 'OTHER'],
    required: true,
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  waivedAmount: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  feeDemandId: { type: Schema.Types.ObjectId, ref: 'FeeDemand' },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  status: {
    type: String,
    enum: ['PENDING', 'PARTIALLY_PAID', 'PAID', 'WAIVED', 'CANCELLED'],
    default: 'PENDING',
  },
  waivedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  waiveReason: String,
}, { timestamps: true });

LibraryFineSchema.plugin(softDeletePlugin);

export default (mongoose.models['LibraryFine'] || (mongoose.models['LibraryFine'] || mongoose.model<ILibraryFine>('LibraryFine', LibraryFineSchema)) as any) as any;
