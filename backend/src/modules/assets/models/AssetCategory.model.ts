import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssetCategory extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  parentCategoryId?: mongoose.Types.ObjectId;
  depreciationMethod?: 'STRAIGHT_LINE' | 'REDUCING_BALANCE' | 'NONE';
  depreciationRate?: number;
}

const AssetCategorySchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  parentCategoryId: { type: Schema.Types.ObjectId, ref: 'AssetCategory' },
  depreciationMethod: {
    type: String,
    enum: ['STRAIGHT_LINE', 'REDUCING_BALANCE', 'NONE'],
    default: 'NONE'
  },
  depreciationRate: Number, // Percentage
}, { timestamps: true });

AssetCategorySchema.plugin(softDeletePlugin);
AssetCategorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default (mongoose.models['AssetCategory'] || mongoose.model<IAssetCategory>('AssetCategory', AssetCategorySchema)) as any;
