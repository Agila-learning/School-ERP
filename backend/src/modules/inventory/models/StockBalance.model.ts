import mongoose, { Document, Schema } from 'mongoose';

export interface IStockBalance extends Document {
  tenantId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  locationId?: mongoose.Types.ObjectId;
  
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  
  // Specific tracking
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: Date;
  
  lastUpdated: Date;
}

const StockBalanceSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
  locationId: { type: Schema.Types.ObjectId, ref: 'Location' },
  
  availableQuantity: { type: Number, required: true, default: 0 },
  reservedQuantity: { type: Number, required: true, default: 0 },
  damagedQuantity: { type: Number, required: true, default: 0 },
  
  batchNumber: String,
  serialNumber: String,
  expiryDate: Date,
  
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure unique balance entry per item/warehouse/location/batch/serial combination
StockBalanceSchema.index({ 
  tenantId: 1, itemId: 1, warehouseId: 1, locationId: 1, batchNumber: 1, serialNumber: 1 
}, { unique: true });

export default (mongoose.models['StockBalance'] || (mongoose.models['StockBalance'] || mongoose.model<IStockBalance>('StockBalance', StockBalanceSchema)) as any) as any;
