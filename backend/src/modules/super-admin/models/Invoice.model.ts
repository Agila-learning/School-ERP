import mongoose, { Document, Schema } from 'mongoose';

export interface ISaasInvoice extends Document {
  invoiceNumber: string;
  tenantId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  planId?: mongoose.Types.ObjectId;
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;
  invoiceDate: Date;
  dueDate: Date;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  taxName?: string;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  couponCode?: string;
  total: number;
  currency: string;
  status: 'DRAFT' | 'ISSUED' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
  paidAmount?: number;
  paidAt?: Date;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
}

const SaasInvoiceSchema: Schema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'TenantSubscription' },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    billingPeriodStart: Date,
    billingPeriodEnd: Date,
    invoiceDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    lineItems: [{
      description: String,
      quantity: { type: Number, default: 1 },
      unitPrice: Number,
      amount: Number,
    }],
    subtotal: { type: Number, required: true, default: 0 },
    taxName: { type: String, default: 'GST' },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: String,
    total: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['DRAFT', 'ISSUED', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED'],
      default: 'DRAFT',
    },
    paidAmount: { type: Number, default: 0 },
    paidAt: Date,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

SaasInvoiceSchema.index({ status: 1 });
SaasInvoiceSchema.index({ dueDate: 1 });

export default (mongoose.models['SaasInvoice'] || mongoose.model<ISaasInvoice>('SaasInvoice', SaasInvoiceSchema)) as any;
