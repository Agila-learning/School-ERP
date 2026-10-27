import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAsset extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  assetTag: string; // AST-2026-000001
  itemId: mongoose.Types.ObjectId; // Link to Item Master
  
  serialNumber?: string;
  brand?: string;
  assetModel?: string;
  
  purchaseOrderId?: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  purchaseDate?: Date;
  purchaseValue?: number;
  
  warrantyEndDate?: Date;
  
  branchId: mongoose.Types.ObjectId;
  currentLocationId?: mongoose.Types.ObjectId;
  
  status: 'AVAILABLE' | 'ASSIGNED' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'LOST' | 'DAMAGED' | 'RETIRED' | 'DISPOSED' | 'RESERVED';
  
  assignedToEmployeeId?: mongoose.Types.ObjectId;
  assignedToDepartmentId?: mongoose.Types.ObjectId;
}

const AssetSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetTag: { type: String, required: true, unique: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  
  serialNumber: String,
  brand: String,
  assetModel: String,
  
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  purchaseDate: Date,
  purchaseValue: Number,
  
  warrantyEndDate: Date,
  
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  currentLocationId: { type: Schema.Types.ObjectId, ref: 'Location' },
  
  status: {
    type: String,
    enum: ['AVAILABLE', 'ASSIGNED', 'IN_USE', 'UNDER_MAINTENANCE', 'LOST', 'DAMAGED', 'RETIRED', 'DISPOSED', 'RESERVED'],
    default: 'AVAILABLE'
  },
  
  assignedToEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  assignedToDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
}, { timestamps: true });

AssetSchema.plugin(softDeletePlugin);
AssetSchema.index({ tenantId: 1, assetTag: 1 }, { unique: true });
AssetSchema.index({ tenantId: 1, serialNumber: 1 }, { unique: true, sparse: true });

export default (mongoose.models['Asset'] || (mongoose.models['Asset'] || mongoose.model<IAsset>('Asset', AssetSchema)) as any) as any;
