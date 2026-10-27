import mongoose, { Document, Schema } from 'mongoose';

export interface IParentTeacherAppointment extends Document {
  tenantId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  
  date: Date;
  startTime: string; // HH:mm format
  endTime: string;
  
  location?: string;
  onlineMeetingLink?: string;
  
  status: 'REQUESTED' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';
  
  reason: string;
  notes?: string;
}

const ParentTeacherAppointmentSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Parent', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  
  location: String,
  onlineMeetingLink: String,
  
  status: {
    type: String,
    enum: ['REQUESTED', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED'],
    default: 'REQUESTED',
    index: true
  },
  
  reason: { type: String, required: true },
  notes: String
}, { timestamps: true });

export default (mongoose.models['ParentTeacherAppointment'] || mongoose.model<IParentTeacherAppointment>('ParentTeacherAppointment', ParentTeacherAppointmentSchema)) as any;
