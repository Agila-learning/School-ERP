import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  code: string;
  legalName?: string;
  schoolType?: 'PRIMARY' | 'SECONDARY' | 'HIGHER_SECONDARY' | 'UNIVERSITY' | 'VOCATIONAL' | 'INTERNATIONAL' | 'OTHER';
  subdomain?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'PROSPECT' | 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED' | 'ARCHIVED' | 'active' | 'suspended' | 'inactive' | 'pending_verification';
  verificationToken?: string;
  storageQuota: number;
  storageUsed: number;
  adminName?: string;
  adminEmail?: string;
  phone?: string;
  website?: string;
  address?: any;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  logo?: string;
  timezone?: string;
  currency?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  onboardingStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  onboardingProgress?: Record<string, any>;
  suspensionReason?: string;
  suspendedBy?: mongoose.Types.ObjectId;
  suspendedAt?: Date;
  archivedAt?: Date;
  archivedBy?: mongoose.Types.ObjectId;
  currentSubscriptionId?: mongoose.Types.ObjectId;
  notes?: string;
}

const TenantSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true, uppercase: true },
    legalName: String,
    schoolType: {
      type: String,
      enum: ['PRIMARY', 'SECONDARY', 'HIGHER_SECONDARY', 'UNIVERSITY', 'VOCATIONAL', 'INTERNATIONAL', 'OTHER'],
    },
    subdomain: { type: String, required: false, lowercase: true },
    adminName: String,
    adminEmail: String,
    phone: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    city: String,
    state: String,
    country: String,
    postalCode: String,
    logo: String,
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    primaryContactName: String,
    primaryContactEmail: String,
    primaryContactPhone: String,
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic',
    },
    status: {
      type: String,
      enum: ['PROSPECT', 'TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED', 'ARCHIVED', 'active', 'suspended', 'inactive', 'pending_verification'],
      default: 'PROSPECT',
    },
    onboardingStatus: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED',
    },
    onboardingProgress: { type: Schema.Types.Mixed, default: {} },
    verificationToken: String,
    storageQuota: { type: Number, default: 5120 },
    storageUsed: { type: Number, default: 0 },
    suspensionReason: String,
    suspendedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    suspendedAt: Date,
    archivedAt: Date,
    archivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    currentSubscriptionId: { type: Schema.Types.ObjectId, ref: 'TenantSubscription' },
    notes: String,
  },
  { timestamps: true }
);

TenantSchema.index({ status: 1 });
TenantSchema.index({ adminEmail: 1 });

export default (mongoose.models['Tenant'] || mongoose.model<ITenant>('Tenant', TenantSchema)) as any;
