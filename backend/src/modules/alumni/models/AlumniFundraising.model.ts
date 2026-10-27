import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAlumniCampaign extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  campaignName: string;
  purpose: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  startDate: Date;
  endDate?: Date;
  status: 'Draft' | 'Pending Approval' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  beneficiary: string;
}

export interface IAlumniContribution extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniProfileId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentId?: mongoose.Types.ObjectId; // References Phase 41 Payment Model
  date: Date;
  contributionType: 'Donation' | 'Scholarship' | 'Event' | 'Infrastructure' | 'Other';
  status: 'Pending' | 'Completed' | 'Failed';
  anonymous: boolean;
}

const AlumniCampaignSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  campaignName: { type: String, required: true },
  purpose: { type: String, required: true },
  description: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: Date,
  status: { type: String, default: 'Draft' },
  beneficiary: String,
}, { timestamps: true });

const AlumniContributionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'AlumniCampaign', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  date: { type: Date, default: Date.now },
  contributionType: { type: String, default: 'Donation' },
  status: { type: String, default: 'Pending' },
  anonymous: { type: Boolean, default: false },
}, { timestamps: true });

[AlumniCampaignSchema, AlumniContributionSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const AlumniCampaign = (mongoose.models['AlumniCampaign'] || mongoose.model<IAlumniCampaign>('AlumniCampaign', AlumniCampaignSchema)) as any;
export const AlumniContribution = (mongoose.models['AlumniContribution'] || mongoose.model<IAlumniContribution>('AlumniContribution', AlumniContributionSchema)) as any;
