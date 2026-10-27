import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILibraryVisit extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  membershipId?: mongoose.Types.ObjectId;
  memberType: 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMINISTRATOR' | 'OTHER' | 'GUEST';
  entryTime: Date;
  exitTime?: Date;
  durationMinutes?: number;
  purpose: 'READING' | 'BOOK_SEARCH' | 'ISSUE_RETURN' | 'STUDY' | 'RESEARCH' | 'CLASS_ACTIVITY' | 'DIGITAL_RESOURCE' | 'OTHER';
  entryMethod: 'CARD_SCAN' | 'ID_SCAN' | 'QR' | 'MANUAL';
  recordedBy?: mongoose.Types.ObjectId;     // Librarian who registered entry
  notes?: string;
}

const LibraryVisitSchema: Schema = new Schema({
  tenantId:     { type: Schema.Types.ObjectId, required: true, index: true },
  branchId:     { type: Schema.Types.ObjectId, index: true },
  libraryId:    { type: Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  membershipId: { type: Schema.Types.ObjectId, ref: 'LibraryMembership' },
  memberType: {
    type: String,
    enum: ['STUDENT', 'TEACHER', 'STAFF', 'ADMINISTRATOR', 'OTHER', 'GUEST'],
    required: true,
  },
  entryTime:  { type: Date, required: true, default: Date.now, index: true },
  exitTime:   { type: Date, index: true },
  durationMinutes: Number,
  purpose: {
    type: String,
    enum: ['READING', 'BOOK_SEARCH', 'ISSUE_RETURN', 'STUDY', 'RESEARCH', 'CLASS_ACTIVITY', 'DIGITAL_RESOURCE', 'OTHER'],
    required: true,
  },
  entryMethod: {
    type: String,
    enum: ['CARD_SCAN', 'ID_SCAN', 'QR', 'MANUAL'],
    default: 'MANUAL',
  },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: String,
}, { timestamps: true });

LibraryVisitSchema.index({ tenantId: 1, libraryId: 1, entryTime: -1 });
LibraryVisitSchema.index({ tenantId: 1, userId: 1, entryTime: -1 });
LibraryVisitSchema.plugin(softDeletePlugin);

export const LibraryVisit = (mongoose.models['LibraryVisit'] || mongoose.model<ILibraryVisit>('LibraryVisit', LibraryVisitSchema)) as any;
