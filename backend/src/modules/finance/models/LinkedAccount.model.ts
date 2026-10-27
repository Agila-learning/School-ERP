import mongoose, { Document, Schema } from 'mongoose';

export interface ILinkedAccount extends Document {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId; // If routing directly to branch
  razorpayAccountId: string; // The acc_XYZ identifier
  status: 'CREATED' | 'ACTIVATED' | 'SUSPENDED';
  onboardingStatus?: string;
  createdAt: Date;
}

const LinkedAccountSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    razorpayAccountId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['CREATED', 'ACTIVATED', 'SUSPENDED'], default: 'CREATED' },
    onboardingStatus: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default (mongoose.models['LinkedAccount'] || mongoose.model<ILinkedAccount>('LinkedAccount', LinkedAccountSchema)) as any;
