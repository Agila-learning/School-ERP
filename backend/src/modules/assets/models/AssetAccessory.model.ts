import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssetAccessory extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId; // The parent asset (e.g., Laptop)
  
  name: string; // e.g., 'Charger', 'Mouse', 'Bag'
  serialNumber?: string;
  brand?: string;
  
  status: 'AVAILABLE' | 'ASSIGNED' | 'LOST' | 'DAMAGED';
  
  isReturnedWithAsset: boolean;
}

const AssetAccessorySchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  
  name: { type: String, required: true },
  serialNumber: String,
  brand: String,
  
  status: {
    type: String,
    enum: ['AVAILABLE', 'ASSIGNED', 'LOST', 'DAMAGED'],
    default: 'AVAILABLE'
  },
  
  isReturnedWithAsset: { type: Boolean, default: false },
}, { timestamps: true });

AssetAccessorySchema.plugin(softDeletePlugin);

export default (mongoose.models['AssetAccessory'] || mongoose.model<IAssetAccessory>('AssetAccessory', AssetAccessorySchema)) as any;
