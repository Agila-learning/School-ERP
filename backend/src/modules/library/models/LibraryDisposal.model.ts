import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type DisposalReason = 'DAMAGED' | 'LOST' | 'OBSOLETE' | 'DUPLICATE' | 'OTHER';

export interface ILibraryDisposal extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  copyId: mongoose.Types.ObjectId;
  reason: DisposalReason;
  conditionPrior: string;
  requestedByUserId: mongoose.Types.ObjectId;
  approvedByUserId?: mongoose.Types.ObjectId;
  disposalDate?: Date;
  status: 'REQUESTED' | 'APPROVED' | 'DISPOSED' | 'REJECTED';
  financialValueLost?: number;
  notes?: string;
}

const LibraryDisposalSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  copyId: { type: Schema.Types.ObjectId, ref: 'BookCopy', required: true, index: true },
  reason: {
    type: String,
    enum: ['DAMAGED', 'LOST', 'OBSOLETE', 'DUPLICATE', 'OTHER'],
    required: true,
  },
  conditionPrior: { type: String, required: true },
  requestedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  disposalDate: Date,
  status: {
    type: String,
    enum: ['REQUESTED', 'APPROVED', 'DISPOSED', 'REJECTED'],
    default: 'REQUESTED',
  },
  financialValueLost: { type: Number, default: 0 },
  notes: String,
}, { timestamps: true });

LibraryDisposalSchema.plugin(softDeletePlugin);

export default (mongoose.models['LibraryDisposal'] || mongoose.model<ILibraryDisposal>('LibraryDisposal', LibraryDisposalSchema)) as any;
