import mongoose, { Document, Schema } from 'mongoose';

export interface IUsageRecord extends Document {
  tenantId: mongoose.Types.ObjectId;
  recordedAt: Date;
  students: number;
  staff: number;
  teachers: number;
  parents: number;
  admins: number;
  branches: number;
  storageUsedMB: number;
  documentsCount: number;
  notificationsSent: number;
  apiRequestsCount: number;
  activeUsersCount: number;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

const UsageRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    recordedAt: { type: Date, required: true, default: Date.now },
    students: { type: Number, default: 0 },
    staff: { type: Number, default: 0 },
    teachers: { type: Number, default: 0 },
    parents: { type: Number, default: 0 },
    admins: { type: Number, default: 0 },
    branches: { type: Number, default: 0 },
    storageUsedMB: { type: Number, default: 0 },
    documentsCount: { type: Number, default: 0 },
    notificationsSent: { type: Number, default: 0 },
    apiRequestsCount: { type: Number, default: 0 },
    activeUsersCount: { type: Number, default: 0 },
    period: { type: String, enum: ['DAILY', 'WEEKLY', 'MONTHLY'], default: 'DAILY' },
  },
  { timestamps: true }
);

UsageRecordSchema.index({ tenantId: 1, recordedAt: -1 });

export default (mongoose.models['UsageRecord'] || mongoose.model<IUsageRecord>('UsageRecord', UsageRecordSchema)) as any;
