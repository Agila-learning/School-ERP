import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPurchaseApproval extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  purchaseRequestId?: mongoose.Types.ObjectId;
  purchaseOrderId?: mongoose.Types.ObjectId;
  
  level: number;
  approverRole?: string; // E.g., 'HOD', 'FINANCE_MANAGER', 'PRINCIPAL'
  approverId?: mongoose.Types.ObjectId; // Specific user ID if known
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  actionDate?: Date;
  remarks?: string;
}

const PurchaseApprovalSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  purchaseRequestId: { type: Schema.Types.ObjectId, ref: 'PurchaseRequest' },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  
  level: { type: Number, required: true },
  approverRole: String,
  approverId: { type: Schema.Types.ObjectId, ref: 'User' },
  
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  
  actionDate: Date,
  remarks: String,
}, { timestamps: true });

PurchaseApprovalSchema.plugin(softDeletePlugin);

export default (mongoose.models['PurchaseApproval'] || mongoose.model<IPurchaseApproval>('PurchaseApproval', PurchaseApprovalSchema)) as any;
