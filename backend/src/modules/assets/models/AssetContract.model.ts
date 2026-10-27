import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssetContract extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  contractNumber: string; // e.g., AMC-2026-0001
  
  vendorId: mongoose.Types.ObjectId;
  assets: mongoose.Types.ObjectId[]; // Array of assets covered by this contract
  
  contractType: 'AMC' | 'LEASE' | 'SERVICE' | 'INSURANCE';
  
  startDate: Date;
  endDate: Date;
  
  cost: number;
  coverageDetails?: string;
  
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'RENEWED';
  documentId?: mongoose.Types.ObjectId; // Link to uploaded contract doc
}

const AssetContractSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  contractNumber: { type: String, required: true, unique: true },
  
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  assets: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
  
  contractType: {
    type: String,
    enum: ['AMC', 'LEASE', 'SERVICE', 'INSURANCE'],
    required: true
  },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  cost: { type: Number, required: true, default: 0 },
  coverageDetails: String,
  
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'RENEWED'],
    default: 'ACTIVE'
  },
  documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
}, { timestamps: true });

AssetContractSchema.plugin(softDeletePlugin);
AssetContractSchema.index({ tenantId: 1, contractNumber: 1 }, { unique: true });

export default (mongoose.models['AssetContract'] || mongoose.model<IAssetContract>('AssetContract', AssetContractSchema)) as any;
