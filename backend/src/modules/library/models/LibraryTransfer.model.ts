import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILibraryTransfer extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  fromLibraryId: mongoose.Types.ObjectId; // Ref Library
  toLibraryId: mongoose.Types.ObjectId; // Ref Library
  copyIds: mongoose.Types.ObjectId[]; // Ref BookCopy
  requestedByUserId: mongoose.Types.ObjectId;
  approvedByUserId?: mongoose.Types.ObjectId;
  dispatchedByUserId?: mongoose.Types.ObjectId;
  receivedByUserId?: mongoose.Types.ObjectId;
  requestDate: Date;
  dispatchDate?: Date;
  receiveDate?: Date;
  status: 'REQUESTED' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED' | 'REJECTED';
  notes?: string;
}

const LibraryTransferSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  fromLibraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  toLibraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  copyIds: [{ type: Schema.Types.ObjectId, ref: 'BookCopy', required: true }],
  requestedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  dispatchedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  receivedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  requestDate: { type: Date, required: true, default: Date.now },
  dispatchDate: Date,
  receiveDate: Date,
  status: {
    type: String,
    enum: ['REQUESTED', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED', 'REJECTED'],
    default: 'REQUESTED',
  },
  notes: String,
}, { timestamps: true });

LibraryTransferSchema.plugin(softDeletePlugin);

export default (mongoose.models['LibraryTransfer'] || mongoose.model<ILibraryTransfer>('LibraryTransfer', LibraryTransferSchema)) as any;
