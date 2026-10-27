import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../../src/core/plugins/softDelete.plugin';

export interface IParentInvitation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId; // The pre-created Parent entity
  tokenHash: string;
  email?: string;
  mobile?: string;
  status: 'SENT' | 'OPENED' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: Date;
}

const ParentInvitationSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
    tokenHash: { type: String, required: true },
    email: String,
    mobile: String,
    status: { type: String, enum: ['SENT', 'OPENED', 'ACCEPTED', 'EXPIRED', 'CANCELLED'], default: 'SENT' },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

ParentInvitationSchema.plugin(softDeletePlugin);

export default (mongoose.models['ParentInvitation'] || mongoose.model<IParentInvitation>('ParentInvitation', ParentInvitationSchema)) as any;
