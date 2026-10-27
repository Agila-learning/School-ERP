import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISupplierQuotation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  purchaseRequestId?: mongoose.Types.ObjectId;
  rfqId?: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  
  quotationNumber: string;
  quotationDate: Date;
  validityDate: Date;
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    taxPercentage: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
  }>;
  
  subTotal: number;
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
  
  shippingCost?: number;
  deliveryTimeDays?: number;
  warrantyTerms?: string;
  paymentTerms?: string;
  
  documentId?: mongoose.Types.ObjectId;
  
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  remarks?: string;
  evaluationScore?: {
    priceScore: number;
    deliveryScore: number;
    qualityScore: number;
    totalScore: number;
  };
}

const SupplierQuotationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  purchaseRequestId: { type: Schema.Types.ObjectId, ref: 'PurchaseRequest' },
  rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  
  quotationNumber: { type: String, required: true },
  quotationDate: { type: Date, required: true, default: Date.now },
  validityDate: { type: Date, required: true },
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    taxPercentage: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
  }],
  
  subTotal: { type: Number, required: true },
  totalTax: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  
  shippingCost: { type: Number, default: 0 },
  deliveryTimeDays: Number,
  warrantyTerms: String,
  paymentTerms: String,
  
  documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
  
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  
  remarks: String,
  evaluationScore: {
    priceScore: Number,
    deliveryScore: Number,
    qualityScore: Number,
    totalScore: Number,
  }
}, { timestamps: true });

SupplierQuotationSchema.plugin(softDeletePlugin);
SupplierQuotationSchema.index({ tenantId: 1, purchaseRequestId: 1, vendorId: 1 }, { unique: true });

export default (mongoose.models['SupplierQuotation'] || mongoose.model<ISupplierQuotation>('SupplierQuotation', SupplierQuotationSchema)) as any;
