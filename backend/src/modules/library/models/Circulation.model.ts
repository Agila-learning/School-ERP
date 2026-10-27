import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IBookIssue extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Member
  bookId: mongoose.Types.ObjectId;
  copyId: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  issuedByUserId: mongoose.Types.ObjectId; // Librarian
  renewalCount: number;
  status: 'ACTIVE' | 'RENEWED' | 'RETURNED' | 'OVERDUE' | 'LOST' | 'CANCELLED';
  // Optimization array for tracking past renewals (historical log)
  renewals: { renewedDate: Date; newDueDate: Date; renewedByUserId: mongoose.Types.ObjectId }[];
}

export interface IBookReturn extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  issueId: mongoose.Types.ObjectId;
  copyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  returnDate: Date;
  receivedByUserId: mongoose.Types.ObjectId;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'POOR' | 'LOST'; // Condition upon return
  fineId?: mongoose.Types.ObjectId; // Ref LibraryFine
  remarks?: string;
}

export interface IBookReservation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  requestedDate: Date;
  queuePosition: number; // Order in queue
  expiryDate?: Date; // If fulfilled but not picked up
  status: 'ACTIVE' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED';
}

const BookIssueSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  membershipId: { type: Schema.Types.ObjectId, ref: 'LibraryMembership', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'BookCatalogue', required: true },
  copyId: { type: Schema.Types.ObjectId, ref: 'BookCopy', required: true },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  issuedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  renewalCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['ACTIVE', 'RENEWED', 'RETURNED', 'OVERDUE', 'LOST', 'CANCELLED'],
    default: 'ACTIVE',
  },
  renewals: [{
    renewedDate: Date,
    newDueDate: Date,
    renewedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  }],
}, { timestamps: true });

// Prevent same copy from being issued twice concurrently
BookIssueSchema.index(
  { tenantId: 1, copyId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['ACTIVE', 'RENEWED', 'OVERDUE'] } } }
);
BookIssueSchema.plugin(softDeletePlugin);

const BookReturnSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  issueId: { type: Schema.Types.ObjectId, ref: 'BookIssue', required: true, unique: true },
  copyId: { type: Schema.Types.ObjectId, ref: 'BookCopy', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  returnDate: { type: Date, required: true },
  receivedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  condition: {
    type: String,
    enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED', 'POOR', 'LOST'],
    required: true,
  },
  fineId: { type: Schema.Types.ObjectId, ref: 'LibraryFine' },
  remarks: String,
}, { timestamps: true });
BookReturnSchema.plugin(softDeletePlugin);

const BookReservationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  membershipId: { type: Schema.Types.ObjectId, ref: 'LibraryMembership', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'BookCatalogue', required: true },
  requestedDate: { type: Date, required: true, default: Date.now },
  queuePosition: { type: Number, required: true },
  expiryDate: Date,
  status: {
    type: String,
    enum: ['ACTIVE', 'FULFILLED', 'EXPIRED', 'CANCELLED'],
    default: 'ACTIVE',
  },
}, { timestamps: true });

// Prevent duplicate active reservation for same user and book
BookReservationSchema.index(
  { tenantId: 1, userId: 1, bookId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' } }
);
BookReservationSchema.plugin(softDeletePlugin);

export const BookIssue = (mongoose.models['BookIssue'] || mongoose.model<IBookIssue>('BookIssue', BookIssueSchema)) as any;
export const BookReturn = (mongoose.models['BookReturn'] || mongoose.model<IBookReturn>('BookReturn', BookReturnSchema)) as any;
export const BookReservation = (mongoose.models['BookReservation'] || mongoose.model<IBookReservation>('BookReservation', BookReservationSchema)) as any;
