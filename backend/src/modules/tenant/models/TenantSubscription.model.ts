import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITenantSubscription extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  
  startDate: Date;
  endDate: Date;
  
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  
  billingCycle: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
  autoRenew: boolean;
  
  price: number;
  discount: number;
  finalAmount: number;
  
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  
  // Usage snapshots
  studentsUsed: number;
  staffUsed: number;
  branchesUsed: number;
  storageUsedMB: number;
}

const TenantSubscriptionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    status: {
      type: String,
      enum: ['TRIAL', 'ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED'],
      default: 'TRIAL',
    },
    
    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'YEARLY', 'LIFETIME'],
      required: true,
    },
    autoRenew: { type: Boolean, default: true },
    
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    
    // Limits used
    studentsUsed: { type: Number, default: 0 },
    staffUsed: { type: Number, default: 0 },
    branchesUsed: { type: Number, default: 0 },
    storageUsedMB: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

TenantSubscriptionSchema.plugin(softDeletePlugin);

// Virtual for checking if expired
TenantSubscriptionSchema.virtual('isExpired').get(function (this: any) {
  return this.endDate < new Date();
});

export default (mongoose.models['TenantSubscription'] || mongoose.model<ITenantSubscription>('TenantSubscription', TenantSubscriptionSchema)) as any;
