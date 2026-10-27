import mongoose, { Document, Schema } from 'mongoose';

export interface IDigitalResourceAccessLog extends Document {
  tenantId: mongoose.Types.ObjectId;
  resourceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  accessType: 'VIEW' | 'DOWNLOAD';
  accessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

const DigitalResourceAccessLogSchema = new Schema<IDigitalResourceAccessLog>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  resourceId: { type: Schema.Types.ObjectId, ref: 'DigitalResource', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  accessType: { type: String, enum: ['VIEW', 'DOWNLOAD'], required: true },
  accessedAt: { type: Date, default: Date.now, index: true },
  ipAddress: String,
  userAgent: String,
  sessionId: String,
}, { timestamps: false });

// TTL index: auto-delete logs older than 2 years to keep collection lean
DigitalResourceAccessLogSchema.index({ accessedAt: 1 }, { expireAfterSeconds: 63072000 });

export default (mongoose.models['DigitalResourceAccessLog'] || mongoose.model<IDigitalResourceAccessLog>('DigitalResourceAccessLog', DigitalResourceAccessLogSchema)) as any;
