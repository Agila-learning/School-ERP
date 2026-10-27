import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type PickupAuthType = 'PERMANENT' | 'TEMPORARY' | 'DATE_SPECIFIC' | 'EMERGENCY';
export type PickupStatus = 'REQUESTED' | 'APPROVED' | 'WAITING' | 'STUDENT_CALLED' | 'RELEASED' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface IAuthorizedPickupPerson extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  name: string;
  relationship: string;
  phone: string;
  photoUrl?: string;
  authorizationType: PickupAuthType;
  validFrom?: Date;
  validUntil?: Date;
  authorizedByParentId?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  isVerified: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface IStudentPickupRequest extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  pickupPersonId?: mongoose.Types.ObjectId; // IAuthorizedPickupPerson
  pickupPersonName: string;
  pickupPersonPhone: string;
  pickupPersonRelationship: string;
  requestedDate: Date;
  requestedTime: string;
  reason: string;
  vehicleNumber?: string;
  requestedBy: mongoose.Types.ObjectId; // parent/guardian who submitted
  approvedBy?: mongoose.Types.ObjectId;
  releasedBy?: mongoose.Types.ObjectId;
  releaseTime?: Date;
  status: PickupStatus;
  rejectionReason?: string;
  identityVerifiedBy?: mongoose.Types.ObjectId;
  notes?: string;
}

const AuthorizedPickupPersonSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
  photoUrl: String,
  authorizationType: { type: String, enum: ['PERMANENT','TEMPORARY','DATE_SPECIFIC','EMERGENCY'], default: 'PERMANENT' },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, index: true },
  authorizedByParentId: { type: Schema.Types.Mixed, ref: 'User' },
  approvedBy: { type: Schema.Types.Mixed, ref: 'User' },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE','EXPIRED','REVOKED'], default: 'ACTIVE', index: true },
}, { timestamps: true });

const StudentPickupRequestSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
  pickupPersonId: { type: Schema.Types.Mixed, ref: 'AuthorizedPickupPerson' },
  pickupPersonName: { type: String, required: true },
  pickupPersonPhone: { type: String, required: true },
  pickupPersonRelationship: { type: String, required: true },
  requestedDate: { type: Date, required: true, default: Date.now, index: true },
  requestedTime: { type: String, required: true },
  reason: { type: String, required: true },
  vehicleNumber: String,
  requestedBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  approvedBy: { type: Schema.Types.Mixed, ref: 'User' },
  releasedBy: { type: Schema.Types.Mixed, ref: 'User' },
  releaseTime: Date,
  status: { type: String, enum: ['REQUESTED','APPROVED','WAITING','STUDENT_CALLED','RELEASED','COMPLETED','REJECTED','CANCELLED'], default: 'REQUESTED', index: true },
  rejectionReason: String,
  identityVerifiedBy: { type: Schema.Types.Mixed, ref: 'User' },
  notes: String,
}, { timestamps: true });

[AuthorizedPickupPersonSchema, StudentPickupRequestSchema].forEach(s => s.plugin(softDeletePlugin));

export const AuthorizedPickupPerson = (mongoose.models['AuthorizedPickupPerson'] || mongoose.model<IAuthorizedPickupPerson>('AuthorizedPickupPerson', AuthorizedPickupPersonSchema)) as any;
export const StudentPickupRequest = (mongoose.models['StudentPickupRequest'] || mongoose.model<IStudentPickupRequest>('StudentPickupRequest', StudentPickupRequestSchema)) as any;
