import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEventCertificate extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  certificateNumber: string;
  awardType: 'Winner' | 'Runner Up' | 'Third Place' | 'Participation' | 'Volunteer' | 'Organizer' | 'Judge';
  issueDate: Date;
  qrCodeUrl?: string;
  status: 'Valid' | 'Revoked';
}

export interface IEventFeedback extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  overallRating: number; // 1-5
  organizationRating: number;
  comments?: string;
}

export interface IEventAlbum extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  mediaUrls: string[];
  visibility: 'Public' | 'School' | 'Participants Only';
  createdBy: mongoose.Types.ObjectId;
}

export interface ISchoolClub extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  clubName: string;
  description: string;
  teacherInCharge: mongoose.Types.ObjectId; // User ID
  maxMembers?: number;
  applicationRequired: boolean;
  status: 'Active' | 'Inactive';
}

export interface IClubLeadership extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  role: string;
  startDate: Date;
  endDate?: Date;
  status: 'Active' | 'Past';
}

export interface IClubProject extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  projectName: string;
  description: string;
  status: 'Idea' | 'Planning' | 'In Progress' | 'Completed' | 'Archived';
}

export interface IClubMembership extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  role: 'Member' | 'President' | 'Secretary' | 'Treasurer';
  joinDate: Date;
  status: 'Active' | 'Inactive';
}

const EventCertificateSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  participantId: { type: Schema.Types.ObjectId, required: true },
  certificateNumber: { type: String, required: true, unique: true },
  awardType: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  qrCodeUrl: String,
  status: { type: String, default: 'Valid' },
}, { timestamps: true });

const EventFeedbackSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  participantId: { type: Schema.Types.ObjectId, required: true },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  organizationRating: { type: Number, required: true, min: 1, max: 5 },
  comments: String,
}, { timestamps: true });

const EventAlbumSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  title: { type: String, required: true },
  description: String,
  mediaUrls: [{ type: String }],
  visibility: { type: String, default: 'School' },
  createdBy: { type: Schema.Types.ObjectId, required: true },
}, { timestamps: true });

const SchoolClubSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  branchId: { type: Schema.Types.ObjectId },
  clubName: { type: String, required: true },
  description: { type: String, required: true },
  teacherInCharge: { type: Schema.Types.ObjectId, required: true },
  maxMembers: Number,
  applicationRequired: { type: Boolean, default: false },
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const ClubLeadershipSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  clubId: { type: Schema.Types.ObjectId, ref: 'SchoolClub', required: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  role: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const ClubProjectSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  clubId: { type: Schema.Types.ObjectId, ref: 'SchoolClub', required: true },
  projectName: { type: String, required: true },
  description: String,
  status: { type: String, default: 'Idea' },
}, { timestamps: true });

const ClubMembershipSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  clubId: { type: Schema.Types.ObjectId, ref: 'SchoolClub', required: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  role: { type: String, default: 'Member' },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Active' },
}, { timestamps: true });

[EventCertificateSchema, EventFeedbackSchema, EventAlbumSchema, SchoolClubSchema, ClubMembershipSchema, ClubLeadershipSchema, ClubProjectSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const EventCertificate = (mongoose.models['EventCertificate'] || mongoose.model<IEventCertificate>('EventCertificate', EventCertificateSchema)) as any;
export const EventFeedback = (mongoose.models['EventFeedback'] || mongoose.model<IEventFeedback>('EventFeedback', EventFeedbackSchema)) as any;
export const EventAlbum = (mongoose.models['EventAlbum'] || mongoose.model<IEventAlbum>('EventAlbum', EventAlbumSchema)) as any;
export const SchoolClub = (mongoose.models['SchoolClub'] || mongoose.model<ISchoolClub>('SchoolClub', SchoolClubSchema)) as any;
export const ClubMembership = (mongoose.models['ClubMembership'] || mongoose.model<IClubMembership>('ClubMembership', ClubMembershipSchema)) as any;
export const ClubLeadership = (mongoose.models['ClubLeadership'] || mongoose.model<IClubLeadership>('ClubLeadership', ClubLeadershipSchema)) as any;
export const ClubProject = (mongoose.models['ClubProject'] || mongoose.model<IClubProject>('ClubProject', ClubProjectSchema)) as any;
