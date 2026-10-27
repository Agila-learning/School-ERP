import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISupplierInvoice extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  vendorId: mongoose.Types.ObjectId;
  purchaseOrderId?: mongoose.Types.ObjectId;
  goodsReceiptId?: mongoose.Types.ObjectId;
  
  invoiceDate: Date;
  dueDate: Date;
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    description: string;
    quantityBilled: number;
    unitPrice: number;
    taxPercentage: number;
    taxAmount: number;
    totalAmount: number;
  }>;
  
  subTotal: number;
  totalTax: number;
  grandTotal: number;
  
  paymentTerms?: string;
  attachmentUrl?: string;
  
  status: 'DRAFT' | 'PENDING_MATCHING' | 'MATCHED' | 'DISCREPANCY' | 'APPROVED_FOR_PAYMENT' | 'PAID' | 'REJECTED';
  
  matchingDetails?: {
    priceMismatch: boolean;
    quantityMismatch: boolean;
    taxMismatch: boolean;
    discrepancyNotes?: string;
  };
}

const SupplierInvoiceSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  invoiceNumber: { type: String, required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  goodsReceiptId: { type: Schema.Types.ObjectId, ref: 'GoodsReceipt' },
  
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    description: String,
    quantityBilled: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    taxPercentage: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
  }],
  
  subTotal: { type: Number, required: true },
  totalTax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  
  paymentTerms: String,
  attachmentUrl: String,
  
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_MATCHING', 'MATCHED', 'DISCREPANCY', 'APPROVED_FOR_PAYMENT', 'PAID', 'REJECTED'],
    default: 'DRAFT'
  },
  
  matchingDetails: {
    priceMismatch: { type: Boolean, default: false },
    quantityMismatch: { type: Boolean, default: false },
    taxMismatch: { type: Boolean, default: false },
    discrepancyNotes: String,
  }
}, { timestamps: true });

SupplierInvoiceSchema.plugin(softDeletePlugin);
SupplierInvoiceSchema.index({ tenantId: 1, invoiceNumber: 1, vendorId: 1 }, { unique: true });

export default (mongoose.models['SupplierInvoice'] || mongoose.model<ISupplierInvoice>('SupplierInvoice', SupplierInvoiceSchema)) as any;
