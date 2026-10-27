import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type AcquisitionSource = 'PURCHASE' | 'DONATION' | 'TRANSFER' | 'OTHER';

export interface ILibraryAcquisition extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  source: AcquisitionSource;
  purchaseOrderId?: mongoose.Types.ObjectId; // Ref to Procurement PO
  goodsReceiptId?: mongoose.Types.ObjectId; // Ref to Procurement GRN
  donorName?: string;
  donorContact?: string;
  transferFromLibraryId?: mongoose.Types.ObjectId;
  acquiredDate: Date;
  processedByUserId: mongoose.Types.ObjectId;
  totalItems: number;
  totalCost?: number;
  status: 'PENDING' | 'PROCESSED' | 'CANCELLED';
  notes?: string;
}

const LibraryAcquisitionSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  source: {
    type: String,
    enum: ['PURCHASE', 'DONATION', 'TRANSFER', 'OTHER'],
    required: true,
  },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  goodsReceiptId: { type: Schema.Types.ObjectId, ref: 'GoodsReceipt' },
  donorName: String,
  donorContact: String,
  transferFromLibraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
  acquiredDate: { type: Date, required: true, default: Date.now },
  processedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  totalItems: { type: Number, required: true, default: 0 },
  totalCost: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSED', 'CANCELLED'],
    default: 'PENDING',
  },
  notes: String,
}, { timestamps: true });

LibraryAcquisitionSchema.plugin(softDeletePlugin);

export default (mongoose.models['LibraryAcquisition'] || mongoose.model<ILibraryAcquisition>('LibraryAcquisition', LibraryAcquisitionSchema)) as any;
