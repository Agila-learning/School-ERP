import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IMedicalEmergency extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  emergencyNumber: string;
  studentId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  location: string;
  reportedByUserId: mongoose.Types.ObjectId;
  symptomsObserved: string;
  immediateAction: string;
  parentContacted: boolean;
  hospitalProviderId?: mongoose.Types.ObjectId;
  transportDetails?: string;
  outcome?: string;
  status: 'REPORTED' | 'UNDER_RESPONSE' | 'PARENT_CONTACTED' | 'TRANSFERRED' | 'HOSPITALIZED' | 'RESOLVED' | 'FOLLOW_UP_REQUIRED' | 'CLOSED';
}

export interface IMedicalReferral extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  reason: string;
  referredByUserId: mongoose.Types.ObjectId;
  referralDate: Date;
  providerId?: mongoose.Types.ObjectId;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  instructions?: string;
  documentUrl?: string;
  status: 'RECOMMENDED' | 'ISSUED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  followUpDate?: Date;
}

export interface IMedicalFollowUp extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  originalVisitId?: mongoose.Types.ObjectId;
  reason: string;
  dueDate: Date;
  assignedProviderId: mongoose.Types.ObjectId;
  instructions?: string;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  completedDate?: Date;
  notes?: string;
}

export interface IMedicalCertificate extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  certificateNumber: string;
  type: 'FITNESS' | 'SICK_LEAVE' | 'SPORTS_FITNESS' | 'RETURN_TO_SCHOOL' | 'OTHER';
  issuedDate: Date;
  validFrom: Date;
  validUntil: Date;
  issuedByProviderId?: mongoose.Types.ObjectId;
  documentUrl?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

const MedicalEmergencySchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  emergencyNumber: { type: String, required: true, unique: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: false, index: true },
  personName: { type: String },
  personType: { type: String, enum: ['STUDENT', 'STAFF', 'VISITOR', 'OTHER'], default: 'STUDENT' },
  date: { type: Date, required: true, default: Date.now },
  time: { type: String, required: true },
  location: { type: String, required: true },
  reportedByUserId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  reportedByName: { type: String },
  symptomsObserved: { type: String, required: true },
  immediateAction: { type: String, required: false },
  parentContacted: { type: Boolean, default: false },
  hospitalProviderId: { type: Schema.Types.Mixed, ref: 'HealthProvider' },
  transportDetails: String,
  outcome: String,
  notes: String,
  status: { type: String, enum: ['REPORTED', 'UNDER_RESPONSE', 'PARENT_CONTACTED', 'TRANSFERRED', 'HOSPITALIZED', 'RESOLVED', 'FOLLOW_UP_REQUIRED', 'CLOSED'], default: 'UNDER_RESPONSE' },
}, { timestamps: true });

const MedicalReferralSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: false, index: true },
  reason: { type: String, required: true },
  referredByUserId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  referralDate: { type: Date, required: true, default: Date.now },
  providerId: { type: Schema.Types.Mixed, ref: 'HealthProvider' },
  urgency: { type: String, enum: ['ROUTINE', 'URGENT', 'EMERGENCY'], default: 'ROUTINE' },
  instructions: String,
  documentUrl: String,
  status: { type: String, enum: ['RECOMMENDED', 'ISSUED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'RECOMMENDED' },
  followUpDate: Date,
}, { timestamps: true });

const MedicalFollowUpSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: false, index: true },
  originalVisitId: { type: Schema.Types.Mixed, ref: 'MedicalVisit' },
  reason: { type: String, required: true },
  dueDate: { type: Date, required: true },
  assignedProviderId: { type: Schema.Types.Mixed, ref: 'Employee', required: false },
  instructions: String,
  status: { type: String, enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'OVERDUE', 'CANCELLED'], default: 'PENDING' },
  completedDate: Date,
  notes: String,
}, { timestamps: true });

const MedicalCertificateSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: false, index: true },
  certificateNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['FITNESS', 'SICK_LEAVE', 'SPORTS_FITNESS', 'RETURN_TO_SCHOOL', 'OTHER'], required: true },
  issuedDate: { type: Date, required: true, default: Date.now },
  validFrom: { type: Date, required: true, default: Date.now },
  validUntil: { type: Date, required: true },
  issuedByProviderId: { type: Schema.Types.Mixed, ref: 'HealthProvider' },
  documentUrl: String,
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'REVOKED'], default: 'ACTIVE' },
}, { timestamps: true });

[MedicalEmergencySchema, MedicalReferralSchema, MedicalFollowUpSchema, MedicalCertificateSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const MedicalEmergency = (mongoose.models['MedicalEmergency'] || mongoose.model<IMedicalEmergency>('MedicalEmergency', MedicalEmergencySchema)) as any;
export const MedicalReferral = (mongoose.models['MedicalReferral'] || mongoose.model<IMedicalReferral>('MedicalReferral', MedicalReferralSchema)) as any;
export const MedicalFollowUp = (mongoose.models['MedicalFollowUp'] || mongoose.model<IMedicalFollowUp>('MedicalFollowUp', MedicalFollowUpSchema)) as any;
export const MedicalCertificate = (mongoose.models['MedicalCertificate'] || mongoose.model<IMedicalCertificate>('MedicalCertificate', MedicalCertificateSchema)) as any;
