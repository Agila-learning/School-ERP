import mongoose, { Document, Schema } from 'mongoose';

export interface IStockTransaction extends Document {
  tenantId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  locationId?: mongoose.Types.ObjectId;
  
  transactionType: 'OPENING' | 'RECEIPT' | 'ISSUE' | 'RETURN' | 'TRANSFER' | 'ADJUSTMENT' | 'CONSUMPTION' | 'DISPOSAL';
  quantity: number; // Positive for incoming, negative for outgoing
  
  referenceDocumentType?: 'PURCHASE_ORDER' | 'GRN' | 'TRANSFER_REQUEST' | 'ADJUSTMENT_NOTE' | 'ASSET_ALLOCATION';
  referenceDocumentId?: mongoose.Types.ObjectId;
  
  performedBy: mongoose.Types.ObjectId;
  reason?: string;
  
  // Specific tracking
  batchNumber?: string;
  serialNumber?: string;
  
  transactionDate: Date;
}

const StockTransactionSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
  locationId: { type: Schema.Types.ObjectId, ref: 'Location' },
  
  transactionType: {
    type: String,
    enum: ['OPENING', 'RECEIPT', 'ISSUE', 'RETURN', 'TRANSFER', 'ADJUSTMENT', 'CONSUMPTION', 'DISPOSAL'],
    required: true,
  },
  quantity: { type: Number, required: true },
  
  referenceDocumentType: {
    type: String,
    enum: ['PURCHASE_ORDER', 'GRN', 'TRANSFER_REQUEST', 'ADJUSTMENT_NOTE', 'ASSET_ALLOCATION'],
  },
  referenceDocumentId: Schema.Types.ObjectId,
  
  performedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  reason: String,
  
  batchNumber: String,
  serialNumber: String,
  
  transactionDate: { type: Date, default: Date.now, required: true },
}, { timestamps: true });

// Prevent modification of transactions - append-only log architecture
StockTransactionSchema.pre('save', function(next: any) {
  if (!this.isNew) {
    return next(new Error('StockTransactions are immutable and cannot be updated') as any);
  }
  next();
});

export default (mongoose.models['StockTransaction'] || (mongoose.models['StockTransaction'] || mongoose.model<IStockTransaction>('StockTransaction', StockTransactionSchema)) as any) as any;
