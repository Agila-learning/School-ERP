import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPurchaseRequest extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  requestNumber: string; // PR-2026-0001
  departmentId?: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    estimatedUnitCost?: number;
    purpose?: string;
  }>;
  
  requiredDate: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ORDERED' | 'COMPLETED' | 'CANCELLED';
  
  estimatedTotalCost: number;
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  rejectionReason?: string;
}

const PurchaseRequestSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  requestNumber: { type: String, required: true, unique: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  requesterId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 },
    estimatedUnitCost: Number,
    purpose: String,
  }],
  
  requiredDate: { type: Date, required: true },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ORDERED', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT'
  },
  
  estimatedTotalCost: { type: Number, default: 0 },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  approvalDate: Date,
  rejectionReason: String,
}, { timestamps: true });

PurchaseRequestSchema.plugin(softDeletePlugin);
PurchaseRequestSchema.index({ tenantId: 1, requestNumber: 1 }, { unique: true });

export default (mongoose.models['PurchaseRequest'] || (mongoose.models['PurchaseRequest'] || mongoose.model<IPurchaseRequest>('PurchaseRequest', PurchaseRequestSchema)) as any) as any;
