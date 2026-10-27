import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformAnnouncement extends Document {
  title: string;
  content: string;
  type: 'MAINTENANCE' | 'FEATURE' | 'BILLING' | 'POLICY' | 'OUTAGE' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetAudience: 'ALL' | 'ACTIVE' | 'TRIAL' | 'ENTERPRISE' | 'SELECTED';
  targetTenants?: mongoose.Types.ObjectId[];
  targetPlans?: mongoose.Types.ObjectId[];
  publishedAt?: Date;
  expiresAt?: Date;
  status: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED';
  createdBy?: mongoose.Types.ObjectId;
}

const PlatformAnnouncementSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['MAINTENANCE', 'FEATURE', 'BILLING', 'POLICY', 'OUTAGE', 'GENERAL'],
      default: 'GENERAL',
    },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    targetAudience: {
      type: String,
      enum: ['ALL', 'ACTIVE', 'TRIAL', 'ENTERPRISE', 'SELECTED'],
      default: 'ALL',
    },
    targetTenants: [{ type: Schema.Types.ObjectId, ref: 'Tenant' }],
    targetPlans: [{ type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' }],
    publishedAt: Date,
    expiresAt: Date,
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'EXPIRED', 'ARCHIVED'], default: 'DRAFT' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default (mongoose.models['PlatformAnnouncement'] || mongoose.model<IPlatformAnnouncement>('PlatformAnnouncement', PlatformAnnouncementSchema)) as any;
