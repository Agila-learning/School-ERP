import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILibraryPurchaseRequest extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  requestNumber: string; // e.g., LBPR-2026-000001

  // Requested book details (may not yet exist in catalogue)
  bookId?: mongoose.Types.ObjectId; // If already in catalogue
  bookTitle: string; // Free-text for new books
  isbn?: string;
  authorName?: string;
  publisherName?: string;
  edition?: string;

  quantity: number;
  estimatedUnitCost?: number;
  estimatedTotalCost?: number;
  
  vendorId?: mongoose.Types.ObjectId;
  
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  reason?: string;
  
  requestedBy: mongoose.Types.ObjectId;
  requestedDate: Date;
  
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  
  approvedBy?: mongoose.Types.ObjectId;
  approvedDate?: Date;
  rejectionReason?: string;
  
  acquisitionId?: mongoose.Types.ObjectId; // Linked once received
  notes?: string;
}

const LibraryPurchaseRequestSchema = new Schema<ILibraryPurchaseRequest>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  requestNumber: { type: String, required: true },
  
  bookId: { type: Schema.Types.ObjectId, ref: 'BookCatalogue' },
  bookTitle: { type: String, required: true },
  isbn: String,
  authorName: String,
  publisherName: String,
  edition: String,
  
  quantity: { type: Number, required: true, min: 1 },
  estimatedUnitCost: Number,
  estimatedTotalCost: Number,
  
  vendorId: { type: Schema.Types.ObjectId, ref: 'LibraryVendor' },
  
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL',
  },
  reason: String,
  
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requestedDate: { type: Date, default: Date.now },
  
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ORDERED', 'RECEIVED', 'CANCELLED'],
    default: 'DRAFT',
    index: true,
  },
  
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedDate: Date,
  rejectionReason: String,
  
  acquisitionId: { type: Schema.Types.ObjectId, ref: 'LibraryAcquisition' },
  notes: String,
}, { timestamps: true });

LibraryPurchaseRequestSchema.index({ tenantId: 1, requestNumber: 1 }, { unique: true });
LibraryPurchaseRequestSchema.plugin(softDeletePlugin);

export default (mongoose.models['LibraryPurchaseRequest'] || mongoose.model<ILibraryPurchaseRequest>('LibraryPurchaseRequest', LibraryPurchaseRequestSchema)) as any;
