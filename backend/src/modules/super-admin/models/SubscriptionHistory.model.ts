import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriptionHistory extends Document {
  tenantId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  previousPlanId?: mongoose.Types.ObjectId;
  newPlanId?: mongoose.Types.ObjectId;
  previousStatus?: string;
  newStatus?: string;
  changeType: 'CREATED' | 'ACTIVATED' | 'UPGRADED' | 'DOWNGRADED' | 'RENEWED' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED' | 'REACTIVATED' | 'MODIFIED';
  reason?: string;
  performedBy?: mongoose.Types.ObjectId;
  effectiveDate: Date;
  notes?: string;
}

const SubscriptionHistorySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'TenantSubscription', required: true, index: true },
    previousPlanId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    newPlanId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    previousStatus: String,
    newStatus: String,
    changeType: {
      type: String,
      enum: ['CREATED', 'ACTIVATED', 'UPGRADED', 'DOWNGRADED', 'RENEWED', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'REACTIVATED', 'MODIFIED'],
      required: true,
    },
    reason: String,
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    effectiveDate: { type: Date, required: true, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);

SubscriptionHistorySchema.index({ createdAt: -1 });

export default (mongoose.models['SubscriptionHistory'] || mongoose.model<ISubscriptionHistory>('SubscriptionHistory', SubscriptionHistorySchema)) as any;
