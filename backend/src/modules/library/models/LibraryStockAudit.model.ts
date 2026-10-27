import mongoose, { Document, Schema } from 'mongoose';

export interface ILibraryStockAudit extends Document {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  auditorId: mongoose.Types.ObjectId;
  auditDate: Date;
  expectedBooksCount: number;
  scannedBooksCount: number;
  missingBooksCount: number;
  extraBooksCount: number;
  damagedBooksCount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  missingCopyIds?: mongoose.Types.ObjectId[];
  damagedCopyIds?: mongoose.Types.ObjectId[];
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LibraryStockAuditSchema = new Schema<ILibraryStockAudit>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
    auditorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    auditDate: { type: Date, required: true, default: Date.now },
    expectedBooksCount: { type: Number, default: 0 },
    scannedBooksCount: { type: Number, default: 0 },
    missingBooksCount: { type: Number, default: 0 },
    extraBooksCount: { type: Number, default: 0 },
    damagedBooksCount: { type: Number, default: 0 },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
    missingCopyIds: [{ type: Schema.Types.ObjectId, ref: 'BookCopy' }],
    damagedCopyIds: [{ type: Schema.Types.ObjectId, ref: 'BookCopy' }],
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const LibraryStockAudit = (mongoose.models['LibraryStockAudit'] || mongoose.model<ILibraryStockAudit>('LibraryStockAudit', LibraryStockAuditSchema)) as any;
export default LibraryStockAudit;
