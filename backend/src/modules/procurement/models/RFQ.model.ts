import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IRFQ extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  rfqNumber: string;
  purchaseRequestId?: mongoose.Types.ObjectId;
  issueDate: Date;
  closingDate: Date;
  
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    description: string;
    quantity: number;
    expectedDate?: Date;
  }>;
  
  invitedVendors: mongoose.Types.ObjectId[]; // Array of Vendor IDs
  termsAndConditions: string;
  deliveryRequirements: string;
  paymentTerms: string;
  
  status: 'DRAFT' | 'PUBLISHED' | 'OPEN' | 'CLOSED' | 'EVALUATION' | 'AWARDED' | 'CANCELLED';
  publishedBy?: mongoose.Types.ObjectId;
}

const RFQSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  rfqNumber: { type: String, required: true, unique: true },
  purchaseRequestId: { type: Schema.Types.ObjectId, ref: 'PurchaseRequest' },
  issueDate: { type: Date, required: true },
  closingDate: { type: Date, required: true },
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    description: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    expectedDate: Date,
  }],
  
  invitedVendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
  termsAndConditions: String,
  deliveryRequirements: String,
  paymentTerms: String,
  
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'OPEN', 'CLOSED', 'EVALUATION', 'AWARDED', 'CANCELLED'],
    default: 'DRAFT'
  },
  publishedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

RFQSchema.plugin(softDeletePlugin);
RFQSchema.index({ tenantId: 1, rfqNumber: 1 }, { unique: true });

export default (mongoose.models['RFQ'] || mongoose.model<IRFQ>('RFQ', RFQSchema)) as any;
