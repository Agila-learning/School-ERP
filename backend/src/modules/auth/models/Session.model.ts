import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  refreshToken: string;
  device?: string;
  ip?: string;
  browser?: string;
  status: 'active' | 'revoked';
  expiresAt: Date;
  lastActivityAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
      index: true,
    },
    device: String,
    ip: String,
    browser: String,
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models['Session'] || (mongoose.models['Session'] || mongoose.model<ISession>('Session', SessionSchema)) as any) as any;
