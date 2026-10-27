import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssetInspection extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
  
  inspectionDate: Date;
  inspectorId: mongoose.Types.ObjectId;
  
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED' | 'UNUSABLE';
  functionality: 'FULLY_FUNCTIONAL' | 'PARTIALLY_FUNCTIONAL' | 'NON_FUNCTIONAL';
  safetyStatus: 'SAFE' | 'NEEDS_ATTENTION' | 'UNSAFE';
  
  issuesFound?: string;
  recommendation?: string;
  
  nextInspectionDate?: Date;
}

const AssetInspectionSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  
  inspectionDate: { type: Date, required: true, default: Date.now },
  inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  condition: {
    type: String,
    enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'UNUSABLE'],
    required: true
  },
  functionality: {
    type: String,
    enum: ['FULLY_FUNCTIONAL', 'PARTIALLY_FUNCTIONAL', 'NON_FUNCTIONAL'],
    required: true
  },
  safetyStatus: {
    type: String,
    enum: ['SAFE', 'NEEDS_ATTENTION', 'UNSAFE'],
    required: true
  },
  
  issuesFound: String,
  recommendation: String,
  
  nextInspectionDate: Date,
}, { timestamps: true });

AssetInspectionSchema.plugin(softDeletePlugin);

export default (mongoose.models['AssetInspection'] || mongoose.model<IAssetInspection>('AssetInspection', AssetInspectionSchema)) as any;
