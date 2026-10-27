import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILibraryFineWaiver extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  fineId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;      // Member or Librarian
  requestedByType: 'MEMBER' | 'LIBRARIAN';
  reason: string;
  waiverAmount: number;                       // Full or partial waiver amount
  waiverType: 'FULL' | 'PARTIAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  approvedAt?: Date;
}

const LibraryFineWaiverSchema: Schema = new Schema({
  tenantId:         { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId:        { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  fineId:           { type: Schema.Types.ObjectId, ref: 'LibraryFine', required: true, index: true },
  requestedBy:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requestedByType:  { type: String, enum: ['MEMBER', 'LIBRARIAN'], required: true },
  reason:           { type: String, required: true },
  waiverAmount:     { type: Number, required: true, min: 0 },
  waiverType:       { type: String, enum: ['FULL', 'PARTIAL'], required: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  },
  reviewedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt:   Date,
  reviewNotes:  String,
  approvedAt:   Date,
}, { timestamps: true });

LibraryFineWaiverSchema.plugin(softDeletePlugin);

export const LibraryFineWaiver = (mongoose.models['LibraryFineWaiver'] || mongoose.model<ILibraryFineWaiver>('LibraryFineWaiver', LibraryFineWaiverSchema)) as any;
