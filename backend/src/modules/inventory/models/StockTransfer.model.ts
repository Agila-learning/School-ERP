import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStockTransfer extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  transferNumber: string; // e.g., TRF-2026-0001
  
  sourceWarehouseId: mongoose.Types.ObjectId;
  destinationWarehouseId: mongoose.Types.ObjectId;
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    requestedQuantity: number;
    dispatchedQuantity?: number;
    receivedQuantity?: number;
    batchNumber?: string;
    serialNumber?: string;
  }>;
  
  status: 'REQUESTED' | 'APPROVED' | 'DISPATCHED' | 'IN_TRANSIT' | 'RECEIVED' | 'REJECTED' | 'CANCELLED';
  
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  dispatchedBy?: mongoose.Types.ObjectId;
  receivedBy?: mongoose.Types.ObjectId;
  
  requestDate: Date;
  dispatchDate?: Date;
  receiveDate?: Date;
  
  remarks?: string;
}

const StockTransferSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  transferNumber: { type: String, required: true, unique: true },
  
  sourceWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  destinationWarehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    requestedQuantity: { type: Number, required: true, min: 1 },
    dispatchedQuantity: { type: Number, default: 0 },
    receivedQuantity: { type: Number, default: 0 },
    batchNumber: String,
    serialNumber: String,
  }],
  
  status: {
    type: String,
    enum: ['REQUESTED', 'APPROVED', 'DISPATCHED', 'IN_TRANSIT', 'RECEIVED', 'REJECTED', 'CANCELLED'],
    default: 'REQUESTED'
  },
  
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  dispatchedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  receivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  requestDate: { type: Date, default: Date.now },
  dispatchDate: Date,
  receiveDate: Date,
  
  remarks: String,
}, { timestamps: true });

StockTransferSchema.plugin(softDeletePlugin);
StockTransferSchema.index({ tenantId: 1, transferNumber: 1 }, { unique: true });

export default (mongoose.models['StockTransfer'] || mongoose.model<IStockTransfer>('StockTransfer', StockTransferSchema)) as any;
