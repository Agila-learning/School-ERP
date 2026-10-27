import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAuthorizedPickupPerson extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  name: string;
  relationship: string; // e.g., Father, Grandparent, Driver
  contactNumber: string;
  photoUrl?: string; // For physical verification by attendant
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date;
}

const AuthorizedPickupPersonSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    contactNumber: { type: String, required: true },
    photoUrl: String,
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, required: true, default: Date.now },
    validUntil: Date,
  },
  { timestamps: true }
);

AuthorizedPickupPersonSchema.plugin(softDeletePlugin);

export default (mongoose.models['AuthorizedPickupPerson'] || (mongoose.models['AuthorizedPickupPerson'] || mongoose.model<IAuthorizedPickupPerson>('AuthorizedPickupPerson', AuthorizedPickupPersonSchema)) as any) as any;
