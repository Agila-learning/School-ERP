import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IRestrictedArea extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  location: string;
  category: 'SERVER_ROOM' | 'CHEMICAL_STORAGE' | 'ELECTRICAL_ROOM' | 'ADMINISTRATION' | 'RECORDS_ROOM' | 'MEDICAL_STORAGE' | 'STAFF_ONLY' | 'OTHER';
  description?: string;
  accessRules: Array<{
    allowedRoles?: string[];
    allowedPersonIds?: mongoose.Types.ObjectId[];
    allowedVisitorTypes?: string[];
    requiresApproval: boolean;
    timeRestrictions?: { startTime: string; endTime: string; daysOfWeek: number[] };
  }>;
  isActive: boolean;
}

export interface ITemporaryAccess extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  personId?: mongoose.Types.ObjectId;
  personName: string;
  personType: string;
  restrictedAreaId?: mongoose.Types.ObjectId;
  areaDescription: string;
  purpose: string;
  validFrom: Date;
  validUntil: Date;
  approvedBy: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  revokedBy?: mongoose.Types.ObjectId;
  revokedAt?: Date;
}

const RestrictedAreaSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, enum: ['SERVER_ROOM','CHEMICAL_STORAGE','ELECTRICAL_ROOM','ADMINISTRATION','RECORDS_ROOM','MEDICAL_STORAGE','STAFF_ONLY','OTHER'], default: 'STAFF_ONLY' },
  description: String,
  accessRules: [{
    allowedRoles: [String],
    allowedPersonIds: [Schema.Types.Mixed],
    allowedVisitorTypes: [String],
    requiresApproval: { type: Boolean, default: true },
    timeRestrictions: {
      startTime: String,
      endTime: String,
      daysOfWeek: [Number],
    },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const TemporaryAccessSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  personId: Schema.Types.Mixed,
  personName: { type: String, required: true },
  personType: { type: String, required: true },
  restrictedAreaId: { type: Schema.Types.Mixed, ref: 'RestrictedArea' },
  areaDescription: { type: String, required: true },
  purpose: { type: String, required: true },
  validFrom: { type: Date, required: true, default: Date.now },
  validUntil: { type: Date, required: true, index: true },
  approvedBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  status: { type: String, enum: ['ACTIVE','EXPIRED','REVOKED'], default: 'ACTIVE', index: true },
  revokedBy: { type: Schema.Types.Mixed, ref: 'User' },
  revokedAt: Date,
}, { timestamps: true });

[RestrictedAreaSchema, TemporaryAccessSchema].forEach(s => s.plugin(softDeletePlugin));

export const RestrictedArea = (mongoose.models['RestrictedArea'] || mongoose.model<IRestrictedArea>('RestrictedArea', RestrictedAreaSchema)) as any;
export const TemporaryAccess = (mongoose.models['TemporaryAccess'] || mongoose.model<ITemporaryAccess>('TemporaryAccess', TemporaryAccessSchema)) as any;
