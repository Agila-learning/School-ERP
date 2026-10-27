import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssetWarranty extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
  
  providerName: string;
  warrantyNumber?: string;
  
  startDate: Date;
  endDate: Date;
  
  coverageDetails?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  
  status: 'ACTIVE' | 'EXPIRED' | 'VOIDED';
}

const AssetWarrantySchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  
  providerName: { type: String, required: true },
  warrantyNumber: String,
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  coverageDetails: String,
  contactPerson: String,
  contactPhone: String,
  contactEmail: String,
  
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'VOIDED'],
    default: 'ACTIVE'
  },
}, { timestamps: true });

AssetWarrantySchema.plugin(softDeletePlugin);

export default (mongoose.models['AssetWarranty'] || mongoose.model<IAssetWarranty>('AssetWarranty', AssetWarrantySchema)) as any;
