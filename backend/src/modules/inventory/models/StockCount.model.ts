import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStockCount extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  countNumber: string; // e.g., CNT-2026-0001
  countDate: Date;
  warehouseId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId; // If cycle count for specific category
  
  countType: 'FULL' | 'CATEGORY' | 'CYCLE';
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    systemQuantity: number;
    physicalQuantity: number;
    difference: number;
    remarks?: string;
  }>;
  
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'RECONCILED';
  
  countedBy: mongoose.Types.ObjectId;
  reconciledBy?: mongoose.Types.ObjectId; // User who approves adjustments based on count
  
  remarks?: string;
}

const StockCountSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  countNumber: { type: String, required: true, unique: true },
  countDate: { type: Date, required: true, default: Date.now },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'ItemCategory' },
  
  countType: {
    type: String,
    enum: ['FULL', 'CATEGORY', 'CYCLE'],
    required: true
  },
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    systemQuantity: { type: Number, required: true },
    physicalQuantity: { type: Number, required: true, default: 0 },
    difference: { type: Number, required: true, default: 0 },
    remarks: String,
  }],
  
  status: {
    type: String,
    enum: ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'RECONCILED'],
    default: 'DRAFT'
  },
  
  countedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reconciledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  remarks: String,
}, { timestamps: true });

StockCountSchema.plugin(softDeletePlugin);
StockCountSchema.index({ tenantId: 1, countNumber: 1 }, { unique: true });

export default (mongoose.models['StockCount'] || mongoose.model<IStockCount>('StockCount', StockCountSchema)) as any;
