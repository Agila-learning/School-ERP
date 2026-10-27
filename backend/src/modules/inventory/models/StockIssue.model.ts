import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStockIssue extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  issueNumber: string; // e.g., ISSUE-2026-0001
  issueDate: Date;
  warehouseId: mongoose.Types.ObjectId;
  
  // Issue recipient
  issuedToType: 'DEPARTMENT' | 'EMPLOYEE' | 'STUDENT' | 'CLASS' | 'OTHER';
  issuedToId?: mongoose.Types.ObjectId;
  recipientName?: string; // Optional if not linked to ID
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    batchNumber?: string;
    serialNumber?: string;
  }>;
  
  status: 'DRAFT' | 'APPROVED' | 'ISSUED' | 'CANCELLED';
  
  requestedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  issuedBy: mongoose.Types.ObjectId; // User executing the issue
  
  remarks?: string;
}

const StockIssueSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  issueNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true, default: Date.now },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  
  issuedToType: { 
    type: String, 
    enum: ['DEPARTMENT', 'EMPLOYEE', 'STUDENT', 'CLASS', 'OTHER'], 
    required: true 
  },
  issuedToId: { type: Schema.Types.ObjectId }, // Flexible ref based on issuedToType
  recipientName: String,
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 },
    batchNumber: String,
    serialNumber: String,
  }],
  
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'ISSUED', 'CANCELLED'],
    default: 'DRAFT'
  },
  
  requestedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  remarks: String,
}, { timestamps: true });

StockIssueSchema.plugin(softDeletePlugin);
StockIssueSchema.index({ tenantId: 1, issueNumber: 1 }, { unique: true });

export default (mongoose.models['StockIssue'] || mongoose.model<IStockIssue>('StockIssue', StockIssueSchema)) as any;
