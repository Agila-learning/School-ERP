import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type SecurityIncidentType = 'UNAUTHORIZED_ENTRY' | 'UNAUTHORIZED_EXIT' | 'LOST_STUDENT' | 'FIGHT' | 'THEFT' | 'PROPERTY_DAMAGE' | 'SUSPICIOUS_ACTIVITY' | 'UNAUTHORIZED_VEHICLE' | 'RESTRICTED_AREA_ACCESS' | 'VISITOR_VIOLATION' | 'GATE_VIOLATION' | 'OTHER';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'REPORTED' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'ESCALATED' | 'ACTION_TAKEN' | 'RESOLVED' | 'CLOSED';

export interface ISecurityIncident extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  incidentNumber: string;
  incidentType: SecurityIncidentType;
  severity: IncidentSeverity;
  description: string;
  location: string;
  gateId?: mongoose.Types.ObjectId;
  incidentDate: Date;
  incidentTime: string;
  involvedPersonId?: mongoose.Types.ObjectId;
  involvedPersonName?: string;
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  status: IncidentStatus;
  resolutionNotes?: string;
  closedAt?: Date;
  closedBy?: mongoose.Types.ObjectId;
  parentNotified: boolean;
  policeReportRequired: boolean;
  policeReportNumber?: string;
}

export interface ISecurityAlert extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alertType: 'FIRE' | 'INTRUSION' | 'UNAUTHORIZED_PERSON' | 'MISSING_STUDENT' | 'SEVERE_WEATHER' | 'MEDICAL_EMERGENCY' | 'SECURITY_THREAT' | 'OTHER';
  title: string;
  description: string;
  severity: IncidentSeverity;
  affectedArea?: string;
  triggeredBy: mongoose.Types.ObjectId;
  incidentId?: mongoose.Types.ObjectId;
  expiresAt?: Date;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'EXPIRED';
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
}

export interface ILockdownEvent extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  lockdownNumber: string;
  scope: 'CAMPUS_WIDE' | 'BUILDING' | 'FLOOR' | 'ZONE' | 'GATE';
  scopeDetails?: string;
  reason: string;
  triggeredBy: mongoose.Types.ObjectId;
  activatedAt: Date;
  allClearIssuedBy?: mongoose.Types.ObjectId;
  allClearAt?: Date;
  allClearReason?: string;
  incidentId?: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'ALL_CLEAR' | 'CANCELLED';
  notificationsSent: boolean;
}

const SecurityIncidentSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  incidentNumber: { type: String, required: true, unique: true },
  incidentType: { type: String, required: true, index: true },
  severity: { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'], required: true, index: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  gateId: { type: Schema.Types.Mixed, ref: 'Gate' },
  incidentDate: { type: Date, required: true, default: Date.now, index: true },
  incidentTime: { type: String, required: true },
  involvedPersonId: Schema.Types.Mixed,
  involvedPersonName: String,
  reportedBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  assignedTo: { type: Schema.Types.Mixed, ref: 'User' },
  status: { type: String, enum: ['REPORTED','ACKNOWLEDGED','INVESTIGATING','ESCALATED','ACTION_TAKEN','RESOLVED','CLOSED'], default: 'REPORTED', index: true },
  resolutionNotes: String,
  closedAt: Date,
  closedBy: { type: Schema.Types.Mixed, ref: 'User' },
  parentNotified: { type: Boolean, default: false },
  policeReportRequired: { type: Boolean, default: false },
  policeReportNumber: String,
}, { timestamps: true });

const SecurityAlertSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  alertType: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, required: true, index: true },
  affectedArea: String,
  triggeredBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  incidentId: { type: Schema.Types.Mixed, ref: 'SecurityIncident' },
  expiresAt: Date,
  status: { type: String, enum: ['ACTIVE','ACKNOWLEDGED','RESOLVED','EXPIRED'], default: 'ACTIVE', index: true },
  resolvedBy: { type: Schema.Types.Mixed, ref: 'User' },
  resolvedAt: Date,
}, { timestamps: true });

const LockdownEventSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  lockdownNumber: { type: String, required: true, unique: true },
  scope: { type: String, enum: ['CAMPUS_WIDE','BUILDING','FLOOR','ZONE','GATE'], required: true },
  scopeDetails: String,
  reason: { type: String, required: true },
  triggeredBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  activatedAt: { type: Date, required: true, default: Date.now },
  allClearIssuedBy: { type: Schema.Types.Mixed, ref: 'User' },
  allClearAt: Date,
  allClearReason: String,
  incidentId: { type: Schema.Types.Mixed, ref: 'SecurityIncident' },
  status: { type: String, enum: ['ACTIVE','ALL_CLEAR','CANCELLED'], default: 'ACTIVE', index: true },
  notificationsSent: { type: Boolean, default: false },
}, { timestamps: true });

[SecurityIncidentSchema, SecurityAlertSchema, LockdownEventSchema].forEach(s => s.plugin(softDeletePlugin));

export const SecurityIncident = (mongoose.models['SecurityIncident'] || mongoose.model<ISecurityIncident>('SecurityIncident', SecurityIncidentSchema)) as any;
export const SecurityAlert = (mongoose.models['SecurityAlert'] || mongoose.model<ISecurityAlert>('SecurityAlert', SecurityAlertSchema)) as any;
export const LockdownEvent = (mongoose.models['LockdownEvent'] || mongoose.model<ILockdownEvent>('LockdownEvent', LockdownEventSchema)) as any;
