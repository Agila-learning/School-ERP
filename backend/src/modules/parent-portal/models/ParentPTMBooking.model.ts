import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../../src/core/plugins/softDelete.plugin';

export interface IParentPTMBooking extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  mode: 'IN_PERSON' | 'ONLINE' | 'PHONE';
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  parentNotes?: string;
  teacherNotes?: string;
  meetingLink?: string; // If ONLINE
}

const ParentPTMBookingSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    mode: { type: String, enum: ['IN_PERSON', 'ONLINE', 'PHONE'], default: 'IN_PERSON' },
    status: { 
      type: String, 
      enum: ['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'], 
      default: 'REQUESTED' 
    },
    parentNotes: String,
    teacherNotes: String,
    meetingLink: String,
  },
  {
    timestamps: true,
  }
);

ParentPTMBookingSchema.plugin(softDeletePlugin);

export default (mongoose.models['ParentPTMBooking'] || mongoose.model<IParentPTMBooking>('ParentPTMBooking', ParentPTMBookingSchema)) as any;
