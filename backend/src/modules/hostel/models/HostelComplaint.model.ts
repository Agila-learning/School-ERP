import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelComplaint extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  raisedByUserId: mongoose.Types.ObjectId;
  category: string; // Configurable: 'ROOM', 'FOOD', 'WATER', 'ELECTRICITY', etc.
  title: string;
  description: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  attachmentUrls: string[];
  assignedToUserId?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
  slaBreached: boolean;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
}

export interface IHostelIncident extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  tripId?: mongoose.Types.ObjectId;
  involvedStudentIds: mongoose.Types.ObjectId[];
  incidentType: string; // 'INJURY', 'MEDICAL', 'FIGHT', 'BULLYING', 'THEFT', 'MISSING_STUDENT', 'FIRE', 'OTHER'
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  incidentDateTime: Date;
  location?: string;
  actionTaken?: string;
  attachmentUrls: string[];
  reportedByUserId: mongoose.Types.ObjectId;
  reviewedByUserId?: mongoose.Types.ObjectId;
  resolution?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
}

const ComplaintSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
  studentId: { type: Schema.Types.ObjectId, ref: 'User' },
  raisedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, default: 'ROOM' },
  title: { type: String, default: 'Hostel Complaint' },
  description: { type: String, required: true },
  priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'EMERGENCY'], default: 'NORMAL' },
  attachmentUrls: [String],
  assignedToUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAt: Date,
  resolvedAt: Date,
  resolutionNotes: String,
  slaBreached: { type: Boolean, default: false },
  status: { type: String, enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'], default: 'OPEN' },
}, { timestamps: true });

ComplaintSchema.plugin(softDeletePlugin);

const IncidentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
  involvedStudentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  incidentType: { type: String, default: 'OTHER' },
  description: { type: String, required: true },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  incidentDateTime: { type: Date, default: Date.now },
  location: String,
  actionTaken: String,
  attachmentUrls: [String],
  reportedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  resolution: String,
  status: { type: String, enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
}, { timestamps: true });

IncidentSchema.plugin(softDeletePlugin);

export const HostelComplaint = (mongoose.models['HostelComplaint'] || mongoose.model<IHostelComplaint>('HostelComplaint', ComplaintSchema)) as any;
export const HostelIncident = (mongoose.models['HostelIncident'] || mongoose.model<IHostelIncident>('HostelIncident', IncidentSchema)) as any;
