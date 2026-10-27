import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelIncident extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  reportedByUserId: mongoose.Types.ObjectId;
  date: Date;
  location: string;
  category: 'MISCONDUCT' | 'FIGHT' | 'BULLYING' | 'THEFT' | 'PROPERTY_DAMAGE' | 'RULE_VIOLATION' | 'SAFETY_ISSUE' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  witnesses?: string;
  actionTaken?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
}

const HostelIncidentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  category: {
    type: String,
    enum: ['MISCONDUCT', 'FIGHT', 'BULLYING', 'THEFT', 'PROPERTY_DAMAGE', 'RULE_VIOLATION', 'SAFETY_ISSUE', 'OTHER'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true,
  },
  description: { type: String, required: true },
  witnesses: String,
  actionTaken: String,
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
  },
}, { timestamps: true });

HostelIncidentSchema.plugin(softDeletePlugin);

export default (mongoose.models['HostelIncident'] || (mongoose.models['HostelIncident'] || mongoose.model<IHostelIncident>('HostelIncident', HostelIncidentSchema)) as any) as any;
