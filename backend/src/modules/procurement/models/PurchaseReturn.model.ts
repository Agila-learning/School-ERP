import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPurchaseReturn extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  returnNumber: string;
  goodsReceiptId: mongoose.Types.ObjectId;
  purchaseOrderId?: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  
  returnDate: Date;
  reason: 'DAMAGED' | 'WRONG_ITEM' | 'EXCESS_QUANTITY' | 'QUALITY_FAILURE' | 'OTHER';
  notes?: string;
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    returnQuantity: number;
    unitPrice: number;
    totalRefundAmount: number;
  }>;
  
  totalRefundExpected: number;
  
  status: 'DRAFT' | 'PENDING_VENDOR' | 'APPROVED' | 'GOODS_DISPATCHED' | 'CREDIT_RECEIVED' | 'REJECTED';
}

const PurchaseReturnSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  returnNumber: { type: String, required: true, unique: true },
  goodsReceiptId: { type: Schema.Types.ObjectId, ref: 'GoodsReceipt', required: true },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  
  returnDate: { type: Date, required: true },
  reason: {
    type: String,
    enum: ['DAMAGED', 'WRONG_ITEM', 'EXCESS_QUANTITY', 'QUALITY_FAILURE', 'OTHER'],
    required: true
  },
  notes: String,
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    returnQuantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalRefundAmount: { type: Number, required: true }
  }],
  
  totalRefundExpected: { type: Number, required: true },
  
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_VENDOR', 'APPROVED', 'GOODS_DISPATCHED', 'CREDIT_RECEIVED', 'REJECTED'],
    default: 'DRAFT'
  },
}, { timestamps: true });

PurchaseReturnSchema.plugin(softDeletePlugin);
PurchaseReturnSchema.index({ tenantId: 1, returnNumber: 1 }, { unique: true });

export default (mongoose.models['PurchaseReturn'] || mongoose.model<IPurchaseReturn>('PurchaseReturn', PurchaseReturnSchema)) as any;
