import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStaffAsset extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  assetName: string;
  assetType: 'LAPTOP' | 'DESKTOP' | 'MOBILE' | 'ID_CARD' | 'KEYS' | 'UNIFORM' | 'EQUIPMENT' | 'OTHER';
  serialNumber?: string;
  inventoryReferenceId?: mongoose.Types.ObjectId; // Links to global Inventory system
  allocationDate: Date;
  conditionAtAllocation: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  returnDate?: Date;
  conditionAtReturn?: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED' | 'LOST';
  status: 'ALLOCATED' | 'RETURNED' | 'LOST' | 'DAMAGED';
}

const StaffAssetSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  assetName: { type: String, required: true },
  assetType: {
    type: String,
    enum: ['LAPTOP', 'DESKTOP', 'MOBILE', 'ID_CARD', 'KEYS', 'UNIFORM', 'EQUIPMENT', 'OTHER'],
    required: true,
  },
  serialNumber: String,
  inventoryReferenceId: Schema.Types.ObjectId,
  allocationDate: { type: Date, required: true, default: Date.now },
  conditionAtAllocation: {
    type: String,
    enum: ['NEW', 'GOOD', 'FAIR', 'POOR'],
    required: true,
  },
  returnDate: Date,
  conditionAtReturn: {
    type: String,
    enum: ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'LOST'],
  },
  status: {
    type: String,
    enum: ['ALLOCATED', 'RETURNED', 'LOST', 'DAMAGED'],
    default: 'ALLOCATED',
  },
}, { timestamps: true });

StaffAssetSchema.plugin(softDeletePlugin);

export default (mongoose.models['StaffAsset'] || (mongoose.models['StaffAsset'] || mongoose.model<IStaffAsset>('StaffAsset', StaffAssetSchema)) as any) as any;
