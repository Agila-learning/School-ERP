import mongoose, { Document, Schema } from 'mongoose';

export interface ISaasCoupon extends Document {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maximumDiscount?: number;
  minimumAmount?: number;
  startDate: Date;
  endDate?: Date;
  usageLimit?: number;
  perSchoolLimit?: number;
  applicablePlans?: mongoose.Types.ObjectId[];
  timesUsed: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdBy?: mongoose.Types.ObjectId;
}

const SaasCouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: String,
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
    discountValue: { type: Number, required: true },
    maximumDiscount: Number,
    minimumAmount: { type: Number, default: 0 },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: Date,
    usageLimit: Number,
    perSchoolLimit: { type: Number, default: 1 },
    applicablePlans: [{ type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' }],
    timesUsed: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'], default: 'ACTIVE' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default (mongoose.models['SaasCoupon'] || mongoose.model<ISaasCoupon>('SaasCoupon', SaasCouponSchema)) as any;
