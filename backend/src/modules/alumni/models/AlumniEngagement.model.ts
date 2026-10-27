import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAlumniEventRegistration extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId; // References core Event model
  alumniProfileId: mongoose.Types.ObjectId;
  registrationDate: Date;
  status: 'Registered' | 'Cancelled' | 'Waitlist' | 'Attended';
  checkInTime?: Date;
}

export interface IAlumniReunion extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId; // References core Event model
  batchId?: mongoose.Types.ObjectId;
  graduationYear?: number;
  organizers: mongoose.Types.ObjectId[]; // AlumniProfileIds
  agenda: string;
}

export interface IAlumniStory extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniProfileId: mongoose.Types.ObjectId;
  title: string;
  storyContent: string;
  achievementHighlight?: string;
  mediaUrls: string[];
  status: 'Draft' | 'Review' | 'Approved' | 'Published';
  publicationDate?: Date;
}

export interface IAlumniVolunteer extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniProfileId: mongoose.Types.ObjectId;
  opportunityId: mongoose.Types.ObjectId;
  status: 'Applied' | 'Approved' | 'Completed' | 'Cancelled';
  hoursContributed?: number;
}

export interface IVolunteerOpportunity extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requiredSkills: string[];
  date: Date;
  location: string;
  capacity: number;
  status: 'Open' | 'Closed' | 'Completed';
}

const AlumniEventRegistrationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Registered' },
  checkInTime: Date,
}, { timestamps: true });

const AlumniReunionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'AlumniBatch' },
  graduationYear: Number,
  organizers: [{ type: Schema.Types.ObjectId, ref: 'AlumniProfile' }],
  agenda: String,
}, { timestamps: true });

const AlumniStorySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  title: { type: String, required: true },
  storyContent: { type: String, required: true },
  achievementHighlight: String,
  mediaUrls: [String],
  status: { type: String, default: 'Draft' },
  publicationDate: Date,
}, { timestamps: true });

const VolunteerOpportunitySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [String],
  date: { type: Date, required: true },
  location: String,
  capacity: { type: Number, default: 1 },
  status: { type: String, default: 'Open' },
}, { timestamps: true });

const AlumniVolunteerSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  opportunityId: { type: Schema.Types.ObjectId, ref: 'VolunteerOpportunity', required: true },
  status: { type: String, default: 'Applied' },
  hoursContributed: Number,
}, { timestamps: true });

[AlumniEventRegistrationSchema, AlumniReunionSchema, AlumniStorySchema, VolunteerOpportunitySchema, AlumniVolunteerSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const AlumniEventRegistration = (mongoose.models['AlumniEventRegistration'] || mongoose.model<IAlumniEventRegistration>('AlumniEventRegistration', AlumniEventRegistrationSchema)) as any;
export const AlumniReunion = (mongoose.models['AlumniReunion'] || mongoose.model<IAlumniReunion>('AlumniReunion', AlumniReunionSchema)) as any;
export const AlumniStory = (mongoose.models['AlumniStory'] || mongoose.model<IAlumniStory>('AlumniStory', AlumniStorySchema)) as any;
export const VolunteerOpportunity = (mongoose.models['VolunteerOpportunity'] || mongoose.model<IVolunteerOpportunity>('VolunteerOpportunity', VolunteerOpportunitySchema)) as any;
export const AlumniVolunteer = (mongoose.models['AlumniVolunteer'] || mongoose.model<IAlumniVolunteer>('AlumniVolunteer', AlumniVolunteerSchema)) as any;
