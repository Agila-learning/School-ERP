import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';
import { LibraryMemberType } from './LibraryMembership.model';

export interface ILibraryPolicy extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  memberType: LibraryMemberType;
  maxBooksAllowed: number;
  issueDurationDays: number;
  renewalLimit: number;
  reservationLimit: number;
  finePerDay: number;
  gracePeriodDays: number;
  isDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

const LibraryPolicySchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  memberType: {
    type: String,
    enum: ['STUDENT', 'TEACHER', 'STAFF', 'RESEARCHER', 'ALUMNI', 'GUEST', 'OTHER'],
    required: true,
  },
  maxBooksAllowed: { type: Number, required: true },
  issueDurationDays: { type: Number, required: true },
  renewalLimit: { type: Number, required: true },
  reservationLimit: { type: Number, required: true },
  finePerDay: { type: Number, required: true },
  gracePeriodDays: { type: Number, required: true, default: 0 },
  isDefault: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
}, { timestamps: true });

// Only one default policy per member type per tenant
LibraryPolicySchema.index(
  { tenantId: 1, memberType: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

LibraryPolicySchema.plugin(softDeletePlugin);

export default (mongoose.models['LibraryPolicy'] || mongoose.model<ILibraryPolicy>('LibraryPolicy', LibraryPolicySchema)) as any;
