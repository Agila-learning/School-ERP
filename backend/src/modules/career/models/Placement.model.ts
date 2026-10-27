import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEmployer extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  organizationName: string;
  industry: string;
  website?: string;
  status: 'Active' | 'Inactive';
}

export interface IPlacementDrive extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  driveName: string;
  status: 'Draft' | 'Registration Open' | 'Registration Closed' | 'Shortlisting' | 'Interview' | 'Completed';
  startDate: Date;
  endDate?: Date;
}

export interface IJobOpening extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  driveId?: mongoose.Types.ObjectId;
  jobTitle: string;
  description: string;
  employmentType: 'Full Time' | 'Internship' | 'Contract';
  applicationDeadline: Date;
  status: 'Open' | 'Closed';
}

export interface IJobApplication extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  driveId?: mongoose.Types.ObjectId;
  status: 'Applied' | 'Shortlisted' | 'Rejected' | 'Interview' | 'Selected' | 'Offer Issued';
  appliedDate: Date;
}

export interface IJobOffer extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  offerDate: Date;
  compensationString: string; // Restricted visibility
  status: 'Pending' | 'Accepted' | 'Declined' | 'Joined';
}

export interface ICareerOutcome extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  outcomeType: 'Placed' | 'Higher Education' | 'Entrepreneurship' | 'Seeking Opportunity' | 'Other';
  organizationOrInstitution: string;
  roleOrProgram: string;
  recordedDate: Date;
}

const EmployerSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  organizationName: { type: String, required: true },
  industry: { type: String, required: true },
  website: String,
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const PlacementDriveSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, required: true },
  employerId: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  driveName: { type: String, required: true },
  status: { type: String, default: 'Draft' },
  startDate: { type: Date, required: true },
  endDate: Date,
}, { timestamps: true });

const JobOpeningSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  employerId: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  driveId: { type: Schema.Types.ObjectId, ref: 'PlacementDrive' },
  jobTitle: { type: String, required: true },
  description: { type: String, required: true },
  employmentType: { type: String, required: true },
  applicationDeadline: { type: Date, required: true },
  status: { type: String, default: 'Open' },
}, { timestamps: true });

const JobApplicationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'JobOpening', required: true },
  driveId: { type: Schema.Types.ObjectId, ref: 'PlacementDrive' },
  status: { type: String, default: 'Applied' },
  appliedDate: { type: Date, default: Date.now },
}, { timestamps: true });

// Prevent duplicate applications
JobApplicationSchema.index({ tenantId: 1, studentId: 1, jobId: 1 }, { unique: true });

const JobOfferSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  employerId: { type: Schema.Types.ObjectId, ref: 'Employer', required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'JobOpening', required: true },
  offerDate: { type: Date, required: true },
  compensationString: { type: String, required: true },
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

const CareerOutcomeSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  outcomeType: { type: String, required: true },
  organizationOrInstitution: { type: String, required: true },
  roleOrProgram: { type: String, required: true },
  recordedDate: { type: Date, default: Date.now },
}, { timestamps: true });

[EmployerSchema, PlacementDriveSchema, JobOpeningSchema, JobApplicationSchema, JobOfferSchema, CareerOutcomeSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const Employer = (mongoose.models['Employer'] || mongoose.model<IEmployer>('Employer', EmployerSchema)) as any;
export const PlacementDrive = (mongoose.models['PlacementDrive'] || mongoose.model<IPlacementDrive>('PlacementDrive', PlacementDriveSchema)) as any;
export const JobOpening = (mongoose.models['JobOpening'] || mongoose.model<IJobOpening>('JobOpening', JobOpeningSchema)) as any;
export const JobApplication = (mongoose.models['JobApplication'] || mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema)) as any;
export const JobOffer = (mongoose.models['JobOffer'] || mongoose.model<IJobOffer>('JobOffer', JobOfferSchema)) as any;
export const CareerOutcome = (mongoose.models['CareerOutcome'] || mongoose.model<ICareerOutcome>('CareerOutcome', CareerOutcomeSchema)) as any;
