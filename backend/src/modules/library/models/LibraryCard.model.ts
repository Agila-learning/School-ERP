import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILibraryCard extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  cardNumber: string;        // Unique per tenant, e.g. LC-2026-00123
  barcode?: string;          // Barcode for scanning
  qrCode?: string;           // QR Code string
  memberType: 'STUDENT' | 'TEACHER' | 'STAFF' | 'ADMINISTRATOR' | 'OTHER';
  validFrom: Date;
  validUntil: Date;
  issuedDate: Date;
  issuedBy: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'EXPIRED' | 'BLOCKED' | 'LOST' | 'REPLACED' | 'CANCELLED';
  blockedReason?: string;
  replacedByCardId?: mongoose.Types.ObjectId;  // If replaced
  remarks?: string;
}

export interface ILibraryCardRequest extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  requestType: 'NEW' | 'REPLACEMENT' | 'RENEWAL';
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED';
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  cardId?: mongoose.Types.ObjectId;
}

const LibraryCardSchema: Schema = new Schema({
  tenantId:     { type: Schema.Types.ObjectId, required: true, index: true },
  branchId:     { type: Schema.Types.ObjectId, index: true },
  libraryId:    { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  membershipId: { type: Schema.Types.ObjectId, ref: 'LibraryMembership', required: true },
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cardNumber:   { type: String, required: true },
  barcode:      { type: String, index: true },
  qrCode:       String,
  memberType: {
    type: String,
    enum: ['STUDENT', 'TEACHER', 'STAFF', 'ADMINISTRATOR', 'OTHER'],
    required: true,
  },
  validFrom:  { type: Date, required: true },
  validUntil: { type: Date, required: true, index: true },
  issuedDate: { type: Date, required: true, default: Date.now },
  issuedBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'BLOCKED', 'LOST', 'REPLACED', 'CANCELLED'],
    default: 'ACTIVE',
    index: true,
  },
  blockedReason:     String,
  replacedByCardId:  { type: Schema.Types.ObjectId, ref: 'LibraryCard' },
  remarks:           String,
}, { timestamps: true });

LibraryCardSchema.index({ tenantId: 1, cardNumber: 1 }, { unique: true });
LibraryCardSchema.index({ tenantId: 1, barcode: 1 }, { unique: true, sparse: true });
LibraryCardSchema.plugin(softDeletePlugin);

const LibraryCardRequestSchema: Schema = new Schema({
  tenantId:     { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId:    { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  membershipId: { type: Schema.Types.ObjectId, ref: 'LibraryMembership', required: true },
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requestType:  { type: String, enum: ['NEW', 'REPLACEMENT', 'RENEWAL'], required: true },
  reason:       String,
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'ISSUED'],
    default: 'PENDING',
    index: true,
  },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  cardId:      { type: Schema.Types.ObjectId, ref: 'LibraryCard' },
}, { timestamps: true });
LibraryCardRequestSchema.plugin(softDeletePlugin);

export const LibraryCard = (mongoose.models['LibraryCard'] || mongoose.model<ILibraryCard>('LibraryCard', LibraryCardSchema)) as any;
export const LibraryCardRequest = (mongoose.models['LibraryCardRequest'] || mongoose.model<ILibraryCardRequest>('LibraryCardRequest', LibraryCardRequestSchema)) as any;
