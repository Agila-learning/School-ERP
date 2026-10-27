import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type BookCopyCondition = 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'POOR' | 'LOST';
export type BookCopyStatus = 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'LOST' | 'DAMAGED' | 'UNDER_REPAIR' | 'DISCARDED' | 'MISSING' | 'ARCHIVED';

export interface IBookCopy extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId; // Ref BookCatalogue
  accessionNumber: string;
  barcode: string;
  qrCode?: string;
  libraryId: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;
  rackId?: mongoose.Types.ObjectId;
  shelfId?: mongoose.Types.ObjectId;
  purchaseDate?: Date;
  acquisitionSource: 'PURCHASE' | 'DONATION' | 'TRANSFER' | 'GRANT' | 'SUBSCRIPTION' | 'OTHER';
  purchasePrice?: number;
  condition: BookCopyCondition;
  status: BookCopyStatus;
  currentHolderId?: mongoose.Types.ObjectId; // Ref User (if ISSUED)
  isReferenceOnly: boolean; // Cannot leave library
}

const BookCopySchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'BookCatalogue', required: true, index: true },
  accessionNumber: { type: String, required: true },
  barcode: { type: String, required: true },
  qrCode: String,
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'LibrarySection' },
  rackId: { type: Schema.Types.ObjectId, ref: 'LibraryRack' },
  shelfId: { type: Schema.Types.ObjectId, ref: 'LibraryShelf' },
  purchaseDate: Date,
  acquisitionSource: {
    type: String,
    enum: ['PURCHASE', 'DONATION', 'TRANSFER', 'GRANT', 'SUBSCRIPTION', 'OTHER'],
    required: true,
  },
  purchasePrice: Number,
  condition: {
    type: String,
    enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED', 'POOR', 'LOST'],
    required: true,
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'ISSUED', 'RESERVED', 'LOST', 'DAMAGED', 'UNDER_REPAIR', 'DISCARDED', 'MISSING', 'ARCHIVED'],
    required: true,
    default: 'AVAILABLE',
  },
  currentHolderId: { type: Schema.Types.ObjectId, ref: 'User' },
  isReferenceOnly: { type: Boolean, default: false },
}, { timestamps: true });

// Unique accession and barcode per tenant
BookCopySchema.index({ tenantId: 1, accessionNumber: 1 }, { unique: true });
BookCopySchema.index({ tenantId: 1, barcode: 1 }, { unique: true });
BookCopySchema.plugin(softDeletePlugin);

export default (mongoose.models['BookCopy'] || (mongoose.models['BookCopy'] || mongoose.model<IBookCopy>('BookCopy', BookCopySchema)) as any) as any;
