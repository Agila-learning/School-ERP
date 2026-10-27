import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPurchaseOrder extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  poNumber: string; // PO-2026-0001
  vendorId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId; // Delivery to which branch
  warehouseId?: mongoose.Types.ObjectId; // Specific warehouse delivery
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    purchaseRequestId?: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    taxPercentage: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
  }>;
  
  deliveryDate: Date;
  subTotal: number;
  totalTax: number;
  totalDiscount: number;
  grandTotal: number;
  
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'ACKNOWLEDGED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CLOSED' | 'CANCELLED';
  
  termsAndConditions?: string;
  paymentTerms?: string;
  
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
}

const PurchaseOrderSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  poNumber: { type: String, required: true, unique: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    purchaseRequestId: { type: Schema.Types.ObjectId, ref: 'PurchaseRequest' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    taxPercentage: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
  }],
  
  deliveryDate: { type: Date, required: true },
  
  subTotal: { type: Number, required: true },
  totalTax: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED'],
    default: 'DRAFT'
  },
  
  termsAndConditions: String,
  paymentTerms: String,
  
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  approvalDate: Date,
}, { timestamps: true });

PurchaseOrderSchema.plugin(softDeletePlugin);
PurchaseOrderSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true });

export default (mongoose.models['PurchaseOrder'] || (mongoose.models['PurchaseOrder'] || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema)) as any) as any;
