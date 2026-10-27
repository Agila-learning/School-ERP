import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISubscriptionPlan extends Document, ISoftDeleted {
  name: string;
  code: string;
  description?: string;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
  price: number;
  currency: string;
  trialDays: number;
  
  // Limits
  maxStudents: number;
  maxStaff: number;
  maxBranches: number;
  storageLimitMB: number;
  
  // Features / Modules Access
  enabledModules: string[];
  
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

const SubscriptionPlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    
    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'YEARLY', 'LIFETIME'],
      default: 'YEARLY',
    },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    trialDays: { type: Number, default: 1 },
    
    // Limits
    maxStudents: { type: Number, default: 100 },
    maxStaff: { type: Number, default: 10 },
    maxBranches: { type: Number, default: 1 },
    storageLimitMB: { type: Number, default: 5120 }, // 5 GB
    
    // Modules
    enabledModules: [{ type: String }],
    
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionPlanSchema.plugin(softDeletePlugin);

export default (mongoose.models['SubscriptionPlan'] || mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema)) as any;
