import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAlumniMentorProfile extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniProfileId: mongoose.Types.ObjectId;
  industry: string;
  experienceYears: number;
  expertise: string[];
  mentorshipAreas: string[];
  availability: 'Available' | 'Full' | 'Unavailable';
  maxMentees: number;
}

export interface IMentorshipRequest extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId; // AlumniProfileId
  menteeId: mongoose.Types.ObjectId; // AlumniProfileId or StudentProfileId
  requestedTopics: string;
  status: 'Requested' | 'Accepted' | 'Rejected' | 'Active' | 'Completed' | 'Cancelled';
  dateRequested: Date;
}

export interface IMentorshipSession extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  mentorshipRequestId: mongoose.Types.ObjectId;
  date: Date;
  durationMinutes: number;
  topic: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  feedbackRating?: number;
  feedbackNotes?: string;
}

const AlumniMentorProfileSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true, unique: true },
  industry: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  expertise: [String],
  mentorshipAreas: [String],
  availability: { type: String, default: 'Available' },
  maxMentees: { type: Number, default: 2 },
}, { timestamps: true });

const MentorshipRequestSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  menteeId: { type: Schema.Types.ObjectId, required: true }, // Not strictly ref'd as it could be Student or Alumni
  requestedTopics: { type: String, required: true },
  status: { type: String, default: 'Requested' },
  dateRequested: { type: Date, default: Date.now },
}, { timestamps: true });

const MentorshipSessionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  mentorshipRequestId: { type: Schema.Types.ObjectId, ref: 'MentorshipRequest', required: true },
  date: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  topic: { type: String, required: true },
  status: { type: String, default: 'Scheduled' },
  feedbackRating: Number,
  feedbackNotes: String,
}, { timestamps: true });

[AlumniMentorProfileSchema, MentorshipRequestSchema, MentorshipSessionSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const AlumniMentorProfile = (mongoose.models['AlumniMentorProfile'] || mongoose.model<IAlumniMentorProfile>('AlumniMentorProfile', AlumniMentorProfileSchema)) as any;
export const MentorshipRequest = (mongoose.models['MentorshipRequest'] || mongoose.model<IMentorshipRequest>('MentorshipRequest', MentorshipRequestSchema)) as any;
export const MentorshipSession = (mongoose.models['MentorshipSession'] || mongoose.model<IMentorshipSession>('MentorshipSession', MentorshipSessionSchema)) as any;
