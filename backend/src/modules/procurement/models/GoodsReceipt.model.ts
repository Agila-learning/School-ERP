import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IGoodsReceipt extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  grnNumber: string; // GRN-2026-0001
  purchaseOrderId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId; // Where it was received
  
  deliveryDate: Date;
  vendorInvoiceNumber?: string;
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    orderedQuantity: number;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    damagedQuantity: number;
    batchNumber?: string;
    serialNumbers?: string[]; // Array of strings if asset/serial tracked
    expiryDate?: Date;
  }>;
  
  receivedBy: mongoose.Types.ObjectId;
  inspectedBy?: mongoose.Types.ObjectId;
  status: 'DRAFT' | 'VERIFIED' | 'REJECTED';
  notes?: string;
}

const GoodsReceiptSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  grnNumber: { type: String, required: true, unique: true },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  
  deliveryDate: { type: Date, required: true, default: Date.now },
  vendorInvoiceNumber: String,
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    orderedQuantity: { type: Number, required: true },
    receivedQuantity: { type: Number, required: true },
    acceptedQuantity: { type: Number, required: true },
    rejectedQuantity: { type: Number, default: 0 },
    damagedQuantity: { type: Number, default: 0 },
    batchNumber: String,
    serialNumbers: [String],
    expiryDate: Date,
  }],
  
  receivedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  inspectedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  status: {
    type: String,
    enum: ['DRAFT', 'VERIFIED', 'REJECTED'],
    default: 'DRAFT'
  },
  notes: String,
}, { timestamps: true });

GoodsReceiptSchema.plugin(softDeletePlugin);
GoodsReceiptSchema.index({ tenantId: 1, grnNumber: 1 }, { unique: true });

export default (mongoose.models['GoodsReceipt'] || (mongoose.models['GoodsReceipt'] || mongoose.model<IGoodsReceipt>('GoodsReceipt', GoodsReceiptSchema)) as any) as any;
