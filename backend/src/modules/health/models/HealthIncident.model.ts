import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHealthIncident extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId; // Optional if it was a staff or general incident
  employeeId?: mongoose.Types.ObjectId;
  reportedByUserId: mongoose.Types.ObjectId;
  type: 'INJURY' | 'SUDDEN_ILLNESS' | 'FAINTING' | 'SPORTS_INJURY' | 'LAB_INCIDENT' | 'TRANSPORT_INCIDENT' | 'OTHER';
  description: string;
  location: string;
  date: Date;
  time: string;
  immediateAction: string;
  firstAidGiven: boolean;
  referredToHospital: boolean;
  parentNotified: boolean;
  status: 'REPORTED' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'CLOSED';
}

const HealthIncidentSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User' },
  employeeId: { type: Schema.Types.Mixed, ref: 'Employee' },
  reportedByUserId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  type: { 
    type: String, 
    enum: ['INJURY', 'SUDDEN_ILLNESS', 'FAINTING', 'SPORTS_INJURY', 'LAB_INCIDENT', 'TRANSPORT_INCIDENT', 'OTHER'], 
    required: true 
  },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  time: { type: String, required: true },
  immediateAction: String,
  firstAidGiven: { type: Boolean, default: false },
  referredToHospital: { type: Boolean, default: false },
  parentNotified: { type: Boolean, default: false },
  status: { type: String, enum: ['REPORTED', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED'], default: 'REPORTED' },
}, { timestamps: true });

[HealthIncidentSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const HealthIncident = (mongoose.models['HealthIncident'] || mongoose.model<IHealthIncident>('HealthIncident', HealthIncidentSchema)) as any;

