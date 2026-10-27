import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IUniversity extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  institutionName: string;
  country: string;
  state?: string;
  city?: string;
  website?: string;
  type: 'College' | 'University' | 'Vocational' | 'Other';
}

export interface IHigherEducationCourse extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  universityId: mongoose.Types.ObjectId;
  programName: string;
  degree: string;
  durationMonths: number;
  applicationDeadline?: Date;
}

export interface IHigherEducationApplication extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  universityId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  applicationNumber?: string;
  status: 'Planning' | 'Draft' | 'Submitted' | 'Under Review' | 'Waitlisted' | 'Accepted' | 'Rejected' | 'Enrolled';
  applicationDate?: Date;
}

const UniversitySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  institutionName: { type: String, required: true },
  country: { type: String, required: true },
  state: String,
  city: String,
  website: String,
  type: { type: String, default: 'University' },
}, { timestamps: true });

const HigherEducationCourseSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
  programName: { type: String, required: true },
  degree: { type: String, required: true },
  durationMonths: Number,
  applicationDeadline: Date,
}, { timestamps: true });

const HigherEducationApplicationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'HigherEducationCourse' },
  applicationNumber: String,
  status: { type: String, default: 'Planning' },
  applicationDate: Date,
}, { timestamps: true });

[UniversitySchema, HigherEducationCourseSchema, HigherEducationApplicationSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const University = (mongoose.models['University'] || mongoose.model<IUniversity>('University', UniversitySchema)) as any;
export const HigherEducationCourse = (mongoose.models['HigherEducationCourse'] || mongoose.model<IHigherEducationCourse>('HigherEducationCourse', HigherEducationCourseSchema)) as any;
export const HigherEducationApplication = (mongoose.models['HigherEducationApplication'] || mongoose.model<IHigherEducationApplication>('HigherEducationApplication', HigherEducationApplicationSchema)) as any;
