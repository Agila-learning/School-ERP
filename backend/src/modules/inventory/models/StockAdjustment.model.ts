import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStockAdjustment extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  adjustmentNumber: string; // e.g., ADJ-2026-0001
  adjustmentDate: Date;
  warehouseId: mongoose.Types.ObjectId;
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    previousQuantity: number;
    newQuantity: number;
    difference: number;
    reason: string;
    batchNumber?: string;
    serialNumber?: string;
  }>;
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  
  remarks?: string;
}

const StockAdjustmentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  adjustmentNumber: { type: String, required: true, unique: true },
  adjustmentDate: { type: Date, required: true, default: Date.now },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    difference: { type: Number, required: true },
    reason: { type: String, required: true },
    batchNumber: String,
    serialNumber: String,
  }],
  
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  remarks: String,
}, { timestamps: true });

StockAdjustmentSchema.plugin(softDeletePlugin);
StockAdjustmentSchema.index({ tenantId: 1, adjustmentNumber: 1 }, { unique: true });

export default (mongoose.models['StockAdjustment'] || mongoose.model<IStockAdjustment>('StockAdjustment', StockAdjustmentSchema)) as any;
