import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IFeatureFlag extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  featureKey: string; // e.g., 'MODULE_LIBRARY', 'MODULE_HOSTEL', 'MODULE_PAYROLL'
  isEnabled: boolean;
  metadata?: Record<string, any>;
}

const FeatureFlagSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    featureKey: { type: String, required: true },
    isEnabled: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

FeatureFlagSchema.index({ tenantId: 1, featureKey: 1 }, { unique: true });
FeatureFlagSchema.plugin(softDeletePlugin);

export default (mongoose.models['FeatureFlag'] || (mongoose.models['FeatureFlag'] || mongoose.model<IFeatureFlag>('FeatureFlag', FeatureFlagSchema)) as any) as any;
