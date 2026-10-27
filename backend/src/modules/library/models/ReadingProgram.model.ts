import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IReadingProgram extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  programType: 'MONTHLY_CHALLENGE' | 'BOOK_CLUB' | 'READING_WEEK' | 'SUMMER_READING' | 'CLASS_PROGRAM' | 'INDIVIDUAL' | 'OTHER';
  targetAudience: string[];                    // e.g., ['Grade 5', 'Grade 6'] or ['ALL']
  startDate: Date;
  endDate: Date;
  goalBooksCount?: number;                     // e.g., 5 books per month
  goalPagesCount?: number;                     // e.g., 300 pages
  eligibleCategories: mongoose.Types.ObjectId[]; // Book categories that count
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdBy: mongoose.Types.ObjectId;
}

export interface IReadingProgramEnrollment extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  programId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  membershipId?: mongoose.Types.ObjectId;
  enrolledAt: Date;
  enrolledBy?: mongoose.Types.ObjectId;         // Self-enrolled or Librarian
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  completedAt?: Date;
  booksReadCount: number;
  pagesReadCount: number;
}

export interface IReadingLog extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;          // If part of a reading program
  bookId?: mongoose.Types.ObjectId;             // BookCatalogue reference
  bookTitle: string;                             // Stored for reference even if book is removed
  authorName?: string;
  startDate: Date;
  completionDate?: Date;
  pagesRead?: number;
  isCompleted: boolean;
  // Rating and review are optional and should be handled with care as sensitive student data
  // Not used for academic grading automatically
  rating?: 1 | 2 | 3 | 4 | 5;
  review?: string;                               // Private unless the program makes it public
  isPublic: boolean;                             // Whether the review is visible to others
}

const ReadingProgramSchema: Schema = new Schema({
  tenantId:  { type: Schema.Types.ObjectId, required: true, index: true },
  branchId:  { type: Schema.Types.ObjectId, index: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  programType: {
    type: String,
    enum: ['MONTHLY_CHALLENGE', 'BOOK_CLUB', 'READING_WEEK', 'SUMMER_READING', 'CLASS_PROGRAM', 'INDIVIDUAL', 'OTHER'],
    required: true,
  },
  targetAudience:    [String],
  startDate:         { type: Date, required: true, index: true },
  endDate:           { type: Date, required: true, index: true },
  goalBooksCount:    Number,
  goalPagesCount:    Number,
  eligibleCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT',
    index: true,
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
ReadingProgramSchema.plugin(softDeletePlugin);

const ReadingProgramEnrollmentSchema: Schema = new Schema({
  tenantId:     { type: Schema.Types.ObjectId, required: true, index: true },
  programId:    { type: Schema.Types.ObjectId, ref: 'ReadingProgram', required: true, index: true },
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  membershipId: { type: Schema.Types.ObjectId, ref: 'LibraryMembership' },
  enrolledAt:   { type: Date, default: Date.now },
  enrolledBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'DROPPED'],
    default: 'ACTIVE',
  },
  completedAt:    Date,
  booksReadCount: { type: Number, default: 0 },
  pagesReadCount: { type: Number, default: 0 },
}, { timestamps: true });
ReadingProgramEnrollmentSchema.index({ tenantId: 1, programId: 1, userId: 1 }, { unique: true });
ReadingProgramEnrollmentSchema.plugin(softDeletePlugin);

const ReadingLogSchema: Schema = new Schema({
  tenantId:   { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId:  { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  programId:  { type: Schema.Types.ObjectId, ref: 'ReadingProgram', index: true },
  bookId:     { type: Schema.Types.ObjectId, ref: 'BookCatalogue', index: true },
  bookTitle:  { type: String, required: true },
  authorName: String,
  startDate:  { type: Date, required: true },
  completionDate: Date,
  pagesRead:  Number,
  isCompleted: { type: Boolean, default: false },
  rating:     { type: Number, enum: [1, 2, 3, 4, 5] },
  review:     String,
  isPublic:   { type: Boolean, default: false },
}, { timestamps: true });
ReadingLogSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
ReadingLogSchema.plugin(softDeletePlugin);

export const ReadingProgram = (mongoose.models['ReadingProgram'] || mongoose.model<IReadingProgram>('ReadingProgram', ReadingProgramSchema)) as any;
export const ReadingProgramEnrollment = (mongoose.models['ReadingProgramEnrollment'] || mongoose.model<IReadingProgramEnrollment>('ReadingProgramEnrollment', ReadingProgramEnrollmentSchema)) as any;
export const ReadingLog = (mongoose.models['ReadingLog'] || mongoose.model<IReadingLog>('ReadingLog', ReadingLogSchema)) as any;
