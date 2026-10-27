import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHealthAppointment extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  providerId?: mongoose.Types.ObjectId; // Optional if external provider
  providerName?: string; // If external
  purpose: string;
  date: Date;
  time: string;
  location: string;
  status: 'REQUESTED' | 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  notes?: string;
}

const HealthAppointmentSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  providerId: { type: Schema.Types.Mixed, ref: 'Employee' },
  providerName: String,
  purpose: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  time: { type: String, required: true },
  location: String,
  status: { 
    type: String, 
    enum: ['REQUESTED', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'], 
    default: 'REQUESTED' 
  },
  notes: String,
}, { timestamps: true });

[HealthAppointmentSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const HealthAppointment = (mongoose.models['HealthAppointment'] || mongoose.model<IHealthAppointment>('HealthAppointment', HealthAppointmentSchema)) as any;

