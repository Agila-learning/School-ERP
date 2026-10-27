import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAlumniJob extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId; // AlumniProfileId
  company: string;
  jobTitle: string;
  industry: string;
  location: string;
  employmentType: 'Full Time' | 'Part Time' | 'Internship' | 'Contract' | 'Freelance' | 'Other';
  experienceLevel: string;
  skills: string[];
  description: string;
  applicationMethod: string;
  applicationDeadline?: Date;
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Open' | 'Closed';
  visibility: 'All Alumni' | 'Specific Batch' | 'Students' | 'School Community';
  adminNotes?: string;
}

export interface IAlumniReferral extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniId: mongoose.Types.ObjectId; // Referrer
  candidateId: mongoose.Types.ObjectId; // Can be student or alumni
  jobId: mongoose.Types.ObjectId; // AlumniJob or external Job ID
  referralDate: Date;
  status: 'Pending' | 'Interviewing' | 'Offered' | 'Rejected' | 'Hired';
  outcomeNotes?: string;
}

const AlumniJobSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  postedBy: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  company: { type: String, required: true },
  jobTitle: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  employmentType: { type: String, required: true },
  experienceLevel: String,
  skills: [String],
  description: { type: String, required: true },
  applicationMethod: { type: String, required: true },
  applicationDeadline: Date,
  status: { type: String, enum: ['Draft', 'Pending Review', 'Approved', 'Rejected', 'Open', 'Closed'], default: 'Pending Review' },
  visibility: { type: String, default: 'All Alumni' },
  adminNotes: String,
}, { timestamps: true });

const AlumniReferralSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  candidateId: { type: Schema.Types.ObjectId, required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'AlumniJob', required: true },
  referralDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
  outcomeNotes: String,
}, { timestamps: true });

[AlumniJobSchema, AlumniReferralSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const AlumniJob = (mongoose.models['AlumniJob'] || mongoose.model<IAlumniJob>('AlumniJob', AlumniJobSchema)) as any;
export const AlumniReferral = (mongoose.models['AlumniReferral'] || mongoose.model<IAlumniReferral>('AlumniReferral', AlumniReferralSchema)) as any;
