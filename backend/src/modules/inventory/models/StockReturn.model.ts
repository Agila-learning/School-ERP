import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStockReturn extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  returnNumber: string; // e.g., RTN-2026-0001
  returnDate: Date;
  warehouseId: mongoose.Types.ObjectId;
  
  issueId?: mongoose.Types.ObjectId; // If returning against a specific issue
  
  returnedByType: 'DEPARTMENT' | 'EMPLOYEE' | 'STUDENT' | 'CLASS' | 'OTHER';
  returnedById?: mongoose.Types.ObjectId;
  returnerName?: string;
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    condition: 'GOOD' | 'DAMAGED' | 'PARTIALLY_DAMAGED' | 'MISSING';
    batchNumber?: string;
    serialNumber?: string;
    remarks?: string;
  }>;
  
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  
  receivedBy: mongoose.Types.ObjectId; // User executing the return receipt
  remarks?: string;
}

const StockReturnSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  returnNumber: { type: String, required: true, unique: true },
  returnDate: { type: Date, required: true, default: Date.now },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  
  issueId: { type: Schema.Types.ObjectId, ref: 'StockIssue' },
  
  returnedByType: { 
    type: String, 
    enum: ['DEPARTMENT', 'EMPLOYEE', 'STUDENT', 'CLASS', 'OTHER'], 
    required: true 
  },
  returnedById: { type: Schema.Types.ObjectId },
  returnerName: String,
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 },
    condition: { 
      type: String, 
      enum: ['GOOD', 'DAMAGED', 'PARTIALLY_DAMAGED', 'MISSING'], 
      default: 'GOOD' 
    },
    batchNumber: String,
    serialNumber: String,
    remarks: String,
  }],
  
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  
  receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  remarks: String,
}, { timestamps: true });

StockReturnSchema.plugin(softDeletePlugin);
StockReturnSchema.index({ tenantId: 1, returnNumber: 1 }, { unique: true });

export default (mongoose.models['StockReturn'] || mongoose.model<IStockReturn>('StockReturn', StockReturnSchema)) as any;
