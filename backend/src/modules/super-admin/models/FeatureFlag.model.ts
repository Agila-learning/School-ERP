import mongoose, { Document, Schema } from 'mongoose';

export interface IFeatureFlag extends Document {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  scope: 'GLOBAL' | 'PER_PLAN' | 'PER_TENANT';
  enabledForPlans?: mongoose.Types.ObjectId[];
  enabledForTenants?: mongoose.Types.ObjectId[];
  rolloutPercentage?: number;
  updatedBy?: mongoose.Types.ObjectId;
}

const FeatureFlagSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true },
    description: String,
    enabled: { type: Boolean, default: false },
    scope: { type: String, enum: ['GLOBAL', 'PER_PLAN', 'PER_TENANT'], default: 'GLOBAL' },
    enabledForPlans: [{ type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' }],
    enabledForTenants: [{ type: Schema.Types.ObjectId, ref: 'Tenant' }],
    rolloutPercentage: { type: Number, default: 100, min: 0, max: 100 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Delete cached model to avoid stale schema issues after hot-reload
if (mongoose.models['FeatureFlag']) {
  delete (mongoose.models as any)['FeatureFlag'];
}

export default mongoose.model<IFeatureFlag>('FeatureFlag', FeatureFlagSchema) as any;
