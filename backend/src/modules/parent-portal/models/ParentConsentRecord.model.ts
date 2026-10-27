import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../../src/core/plugins/softDelete.plugin';

export interface IParentConsentRecord extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  consentType: string;
  version: string;
  decision: 'ACCEPTED' | 'DECLINED' | 'PENDING';
  ipAddress?: string;
  userAgent?: string;
  expiresAt?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

const ParentConsentRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    consentType: { type: String, required: true },
    version: { type: String, required: true },
    decision: { type: String, enum: ['ACCEPTED', 'DECLINED', 'PENDING'], default: 'PENDING' },
    ipAddress: String,
    userAgent: String,
    expiresAt: Date,
    status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'REVOKED'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

ParentConsentRecordSchema.plugin(softDeletePlugin);

export default (mongoose.models['ParentConsentRecord'] || mongoose.model<IParentConsentRecord>('ParentConsentRecord', ParentConsentRecordSchema)) as any;
