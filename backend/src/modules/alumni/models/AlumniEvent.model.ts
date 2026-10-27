import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAlumniEvent extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventName: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  onlineLink?: string;
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  organizer: mongoose.Types.ObjectId; // User or Alumni
  registrationDeadline: Date;
  status: 'Draft' | 'Published' | 'Ongoing' | 'Completed' | 'Cancelled';
  eventType: 'Reunion' | 'Networking' | 'Career Talk' | 'Webinar' | 'Workshop' | 'Other';
}

export interface IAlumniEventRegistration extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  alumniId: mongoose.Types.ObjectId;
  registrationDate: Date;
  status: 'Registered' | 'Waitlisted' | 'Cancelled' | 'Attended';
  ticketReference: string;
  feedback?: string;
  rating?: number;
}

const AlumniEventSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventName: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  onlineLink: String,
  capacity: { type: Number, required: true },
  registeredCount: { type: Number, default: 0 },
  waitlistCount: { type: Number, default: 0 },
  organizer: { type: Schema.Types.ObjectId, required: true },
  registrationDeadline: { type: Date, required: true },
  status: { type: String, enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Cancelled'], default: 'Draft' },
  eventType: { type: String, required: true },
}, { timestamps: true });

const AlumniEventRegistrationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'AlumniEvent', required: true },
  alumniId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Registered', 'Waitlisted', 'Cancelled', 'Attended'], default: 'Registered' },
  ticketReference: { type: String, required: true, unique: true },
  feedback: String,
  rating: Number,
}, { timestamps: true });

[AlumniEventSchema, AlumniEventRegistrationSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const AlumniEvent = (mongoose.models['AlumniEvent'] || mongoose.model<IAlumniEvent>('AlumniEvent', AlumniEventSchema)) as any;
export const AlumniEventRegistration = (mongoose.models['AlumniEventRegistration'] || mongoose.model<IAlumniEventRegistration>('AlumniEventRegistration', AlumniEventRegistrationSchema)) as any;
