import mongoose, { Document, Schema } from 'mongoose';

export interface IInvitation extends Document {
  email: string;
  roleId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  acceptedAt?: Date;
}

const InvitationSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED'],
      default: 'PENDING',
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default (mongoose.models['Invitation'] || (mongoose.models['Invitation'] || mongoose.model<IInvitation>('Invitation', InvitationSchema)) as any) as any;
