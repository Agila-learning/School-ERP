import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type LibraryMemberType = 'STUDENT' | 'TEACHER' | 'STAFF' | 'RESEARCHER' | 'ALUMNI' | 'GUEST' | 'OTHER';

export interface ILibraryMembership extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // References existing User (Student/Employee)
  academicYearId: mongoose.Types.ObjectId;
  libraryId?: mongoose.Types.ObjectId; // If scoped to a specific library
  membershipNumber: string;
  memberType: LibraryMemberType;
  startDate: Date;
  expiryDate?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'BLOCKED' | 'CANCELLED';
  // Snapshot of rules from MembershipRule engine at time of creation, or overrides
  maxBooksAllowed: number;
  issueDurationDays: number;
  renewalLimit: number;
  reservationLimit: number;
  finePerDay: number;
  gracePeriodDays: number;
}

const LibraryMembershipSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear' },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library' },
  membershipNumber: { 
    type: String, 
    required: true, 
    default: () => `MEM-${Date.now().toString().slice(-6)}` 
  },
  memberType: {
    type: String,
    enum: ['STUDENT', 'TEACHER', 'STAFF', 'RESEARCHER', 'ALUMNI', 'GUEST', 'OTHER'],
    default: 'STUDENT',
  },
  startDate: { type: Date, required: true, default: Date.now },
  expiryDate: Date,
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED', 'BLOCKED', 'CANCELLED'],
    default: 'ACTIVE',
  },
  maxBooksAllowed: { type: Number, required: true, default: 5 },
  issueDurationDays: { type: Number, required: true, default: 14 },
  renewalLimit: { type: Number, required: true, default: 2 },
  reservationLimit: { type: Number, required: true, default: 2 },
  finePerDay: { type: Number, required: true, default: 5 },
  gracePeriodDays: { type: Number, required: true, default: 2 },
}, { timestamps: true });

LibraryMembershipSchema.index({ tenantId: 1, membershipNumber: 1 }, { unique: true });
// Prevent duplicate active membership for same user in same academic year
LibraryMembershipSchema.index({ tenantId: 1, userId: 1, academicYearId: 1, status: 1 });
LibraryMembershipSchema.plugin(softDeletePlugin);

export default (mongoose.models['LibraryMembership'] || (mongoose.models['LibraryMembership'] || mongoose.model<ILibraryMembership>('LibraryMembership', LibraryMembershipSchema)) as any) as any;
