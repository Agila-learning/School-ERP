import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ICareerCounselor extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  specialization: string[];
  status: 'Active' | 'Inactive';
}

export interface ICounselingAppointment extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  counselorId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  mode: 'In Person' | 'Online' | 'Phone';
  purpose: string;
  status: 'Requested' | 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';
}

export interface ICounselingNote extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  counselorId: mongoose.Types.ObjectId;
  summary: string;
  recommendations?: string;
  visibility: 'Private to Counselor' | 'Shared with Student' | 'Shared with Parent';
}

const CareerCounselorSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  employeeId: { type: Schema.Types.ObjectId, required: true },
  specialization: [String],
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const CounselingAppointmentSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  counselorId: { type: Schema.Types.ObjectId, ref: 'CareerCounselor', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  mode: { type: String, default: 'In Person' },
  purpose: { type: String, required: true },
  status: { type: String, default: 'Requested' },
}, { timestamps: true });

// Check for conflicting counselor time
CounselingAppointmentSchema.index({ tenantId: 1, counselorId: 1, date: 1, startTime: 1 }, { unique: true });

const CounselingNoteSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'CounselingAppointment', required: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  counselorId: { type: Schema.Types.ObjectId, ref: 'CareerCounselor', required: true },
  summary: { type: String, required: true },
  recommendations: String,
  visibility: { type: String, default: 'Private to Counselor' },
}, { timestamps: true });

[CareerCounselorSchema, CounselingAppointmentSchema, CounselingNoteSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const CareerCounselor = (mongoose.models['CareerCounselor'] || mongoose.model<ICareerCounselor>('CareerCounselor', CareerCounselorSchema)) as any;
export const CounselingAppointment = (mongoose.models['CounselingAppointment'] || mongoose.model<ICounselingAppointment>('CounselingAppointment', CounselingAppointmentSchema)) as any;
export const CounselingNote = (mongoose.models['CounselingNote'] || mongoose.model<ICounselingNote>('CounselingNote', CounselingNoteSchema)) as any;
