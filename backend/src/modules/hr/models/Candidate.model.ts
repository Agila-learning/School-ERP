import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ICandidate extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  candidateNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  highestQualification?: string;
  totalExperienceYears?: number;
  skills: string[];
  source: 'Website' | 'Job Portal' | 'Referral' | 'Walk-in' | 'Agency' | 'Campus' | 'Other';
  appliedRequisitionId?: mongoose.Types.ObjectId;
  applicationDate: Date;
  status: 'Applied' | 'Screening' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected' | 'Withdrawn' | 'Offer Sent' | 'Offer Accepted' | 'Offer Declined';
}

const CandidateSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  candidateNumber: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resumeUrl: String,
  highestQualification: String,
  totalExperienceYears: Number,
  skills: [String],
  source: {
    type: String,
    enum: ['Website', 'Job Portal', 'Referral', 'Walk-in', 'Agency', 'Campus', 'Other'],
    default: 'Other',
  },
  appliedRequisitionId: { type: Schema.Types.ObjectId, ref: 'JobRequisition' },
  applicationDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn', 'Offer Sent', 'Offer Accepted', 'Offer Declined'],
    default: 'Applied',
  },
}, { timestamps: true });

CandidateSchema.index({ tenantId: 1, candidateNumber: 1 }, { unique: true });
// Avoid duplicate candidate emails per tenant
CandidateSchema.index({ tenantId: 1, email: 1 });
CandidateSchema.plugin(softDeletePlugin);

export default (mongoose.models['Candidate'] || (mongoose.models['Candidate'] || mongoose.model<ICandidate>('Candidate', CandidateSchema)) as any) as any;
