import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IWorkOrder extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  workOrderNumber: string;
  maintenanceRequestId?: mongoose.Types.ObjectId; // References AssetMaintenance
  
  assetId?: mongoose.Types.ObjectId;
  facilityId?: mongoose.Types.ObjectId;
  
  assignedTechnicianId?: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  
  title: string;
  description: string;
  
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'DRAFT' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED' | 'VERIFIED' | 'CLOSED';
  
  scheduledStartDate?: Date;
  dueDate?: Date;
  actualCompletionDate?: Date;
  
  estimatedCost?: number;
  actualLaborCost?: number;
  actualPartsCost?: number;
  
  partsConsumed: {
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    stockTransactionId?: mongoose.Types.ObjectId;
  }[];
  
  checklist: {
    task: string;
    isCompleted: boolean;
    completedAt?: Date;
  }[];
}

const WorkOrderSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  workOrderNumber: { type: String, required: true },
  maintenanceRequestId: { type: Schema.Types.ObjectId, ref: 'AssetMaintenance' },
  
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset' },
  facilityId: Schema.Types.ObjectId,
  
  assignedTechnicianId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  priority: { type: String, default: 'MEDIUM' },
  status: { type: String, default: 'DRAFT' },
  
  scheduledStartDate: Date,
  dueDate: Date,
  actualCompletionDate: Date,
  
  estimatedCost: Number,
  actualLaborCost: Number,
  actualPartsCost: Number,
  
  partsConsumed: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
    quantity: Number,
    stockTransactionId: { type: Schema.Types.ObjectId, ref: 'StockTransaction' },
  }],
  
  checklist: [{
    task: String,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date
  }],
}, { timestamps: true });

WorkOrderSchema.plugin(softDeletePlugin);

export const WorkOrder = (mongoose.models['WorkOrder'] || mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema)) as any;
