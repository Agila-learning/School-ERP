import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssetAudit extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  auditNumber: string; // e.g., AUD-2026-0001
  auditDate: Date;
  
  locationId?: mongoose.Types.ObjectId; // Audit specific location
  categoryId?: mongoose.Types.ObjectId; // Or specific category
  
  items: Array<{
    assetId: mongoose.Types.ObjectId;
    expectedLocationId?: mongoose.Types.ObjectId;
    actualLocationId?: mongoose.Types.ObjectId;
    status: 'FOUND' | 'MISSING' | 'WRONG_LOCATION' | 'DAMAGED' | 'UNVERIFIED';
    remarks?: string;
  }>;
  
  auditedBy: mongoose.Types.ObjectId;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'RECONCILED';
  remarks?: string;
}

const AssetAuditSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  auditNumber: { type: String, required: true, unique: true },
  auditDate: { type: Date, required: true, default: Date.now },
  
  locationId: { type: Schema.Types.ObjectId, ref: 'AssetLocation' },
  categoryId: { type: Schema.Types.ObjectId, ref: 'AssetCategory' },
  
  items: [{
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    expectedLocationId: { type: Schema.Types.ObjectId, ref: 'AssetLocation' },
    actualLocationId: { type: Schema.Types.ObjectId, ref: 'AssetLocation' },
    status: {
      type: String,
      enum: ['FOUND', 'MISSING', 'WRONG_LOCATION', 'DAMAGED', 'UNVERIFIED'],
      default: 'UNVERIFIED'
    },
    remarks: String,
  }],
  
  auditedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  status: {
    type: String,
    enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'RECONCILED'],
    default: 'DRAFT'
  },
  remarks: String,
}, { timestamps: true });

AssetAuditSchema.plugin(softDeletePlugin);
AssetAuditSchema.index({ tenantId: 1, auditNumber: 1 }, { unique: true });

export default (mongoose.models['AssetAudit'] || mongoose.model<IAssetAudit>('AssetAudit', AssetAuditSchema)) as any;
