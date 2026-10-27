import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssetMaintenance extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
  
  maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'WARRANTY' | 'AMC';
  status: 'REPORTED' | 'ASSIGNED' | 'UNDER_INSPECTION' | 'WAITING_FOR_PARTS' | 'UNDER_REPAIR' | 'TESTING' | 'COMPLETED' | 'CANCELLED';
  
  reportedBy: mongoose.Types.ObjectId;
  reportedDate: Date;
  
  issueDescription: string;
  
  vendorId?: mongoose.Types.ObjectId;
  assignedTechnicianName?: string;
  
  startDate?: Date;
  endDate?: Date;
  
  workPerformed?: string;
  partsUsed?: string;
  
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  
  coveredByWarranty: boolean;
  remarks?: string;
}

const AssetMaintenanceSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  
  maintenanceType: {
    type: String,
    enum: ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'WARRANTY', 'AMC'],
    required: true
  },
  
  status: {
    type: String,
    enum: ['REPORTED', 'ASSIGNED', 'UNDER_INSPECTION', 'WAITING_FOR_PARTS', 'UNDER_REPAIR', 'TESTING', 'COMPLETED', 'CANCELLED'],
    default: 'REPORTED'
  },
  
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedDate: { type: Date, required: true, default: Date.now },
  
  issueDescription: { type: String, required: true },
  
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  assignedTechnicianName: String,
  
  startDate: Date,
  endDate: Date,
  
  workPerformed: String,
  partsUsed: String,
  
  laborCost: { type: Number, default: 0 },
  partsCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  
  coveredByWarranty: { type: Boolean, default: false },
  remarks: String,
}, { timestamps: true });

AssetMaintenanceSchema.plugin(softDeletePlugin);

export default (mongoose.models['AssetMaintenance'] || mongoose.model<IAssetMaintenance>('AssetMaintenance', AssetMaintenanceSchema)) as any;
