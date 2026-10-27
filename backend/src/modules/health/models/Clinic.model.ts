import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IMedicalVisit extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  visitNumber: string;
  studentId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  reason: string;
  visitType: 'ROUTINE' | 'FIRST_AID' | 'ILLNESS' | 'INJURY' | 'EMERGENCY' | 'FOLLOW_UP' | 'HEALTH_SCREENING' | 'MEDICATION' | 'OTHER';
  symptoms: string[];
  observedCondition?: string;
  assessment?: string;
  treatmentId?: mongoose.Types.ObjectId;
  instructions?: string;
  disposition: 'RETURNED_TO_CLASS' | 'REST_AT_CLINIC' | 'RETURNED_TO_HOSTEL' | 'PARENT_PICKUP' | 'REFERRED_TO_DOCTOR' | 'HOSPITAL_REFERRAL' | 'EMERGENCY_TRANSFER' | 'OTHER';
  providerId: mongoose.Types.ObjectId;
  status: 'REGISTERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface IMedicalVital extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  visitId: mongoose.Types.ObjectId;
  temperatureC?: number;
  pulseBpm?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  respiratoryRate?: number;
  oxygenSaturationPct?: number;
  recordedAt: Date;
}

export interface IMedicalTreatment extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  visitId: mongoose.Types.ObjectId;
  type: 'MINOR_INJURY' | 'CUTS' | 'BRUISES' | 'SPRAINS' | 'MINOR_BURNS' | 'HEAD_INJURY' | 'SPORTS_INJURY' | 'OTHER' | 'CLINICAL';
  firstAidProvided?: string;
  materialsUsed?: string[];
  providerId: mongoose.Types.ObjectId;
  outcome?: string;
  parentNotified: boolean;
  time: Date;
}

const MedicalVisitSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  visitNumber: { type: String, required: true, unique: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: false, index: true },
  studentName: { type: String },
  date: { type: Date, required: true, default: Date.now },
  time: { type: String, required: true },
  reason: { type: String, required: true },
  visitType: { type: String, enum: ['ROUTINE', 'FIRST_AID', 'ILLNESS', 'INJURY', 'EMERGENCY', 'FOLLOW_UP', 'HEALTH_SCREENING', 'MEDICATION', 'OTHER'], default: 'ROUTINE' },
  symptoms: [String],
  observedCondition: String,
  assessment: String,
  treatmentId: { type: Schema.Types.Mixed, ref: 'MedicalTreatment' },
  firstAidGiven: String,
  instructions: String,
  disposition: { type: String, enum: ['RETURNED_TO_CLASS', 'REST_AT_CLINIC', 'RETURNED_TO_HOSTEL', 'PARENT_PICKUP', 'REFERRED_TO_DOCTOR', 'HOSPITAL_REFERRAL', 'EMERGENCY_TRANSFER', 'OTHER'], default: 'RETURNED_TO_CLASS' },
  providerId: { type: Schema.Types.Mixed, ref: 'Employee', required: false },
  providerName: { type: String },
  status: { type: String, enum: ['REGISTERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
}, { timestamps: true });

const MedicalVitalSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  visitId: { type: Schema.Types.Mixed, ref: 'MedicalVisit', required: true },
  temperatureC: Number,
  pulseBpm: Number,
  bloodPressureSystolic: Number,
  bloodPressureDiastolic: Number,
  respiratoryRate: Number,
  oxygenSaturationPct: Number,
  recordedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const MedicalTreatmentSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  visitId: { type: Schema.Types.Mixed, ref: 'MedicalVisit', required: true },
  type: { type: String, enum: ['MINOR_INJURY', 'CUTS', 'BRUISES', 'SPRAINS', 'MINOR_BURNS', 'HEAD_INJURY', 'SPORTS_INJURY', 'OTHER', 'CLINICAL'], required: true },
  firstAidProvided: String,
  materialsUsed: [String],
  providerId: { type: Schema.Types.Mixed, ref: 'Employee', required: false },
  outcome: String,
  parentNotified: { type: Boolean, default: false },
  time: { type: Date, default: Date.now },
}, { timestamps: true });

[MedicalVisitSchema, MedicalVitalSchema, MedicalTreatmentSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const MedicalVisit = (mongoose.models['MedicalVisit'] || mongoose.model<IMedicalVisit>('MedicalVisit', MedicalVisitSchema)) as any;
export const MedicalVital = (mongoose.models['MedicalVital'] || mongoose.model<IMedicalVital>('MedicalVital', MedicalVitalSchema)) as any;
export const MedicalTreatment = (mongoose.models['MedicalTreatment'] || mongoose.model<IMedicalTreatment>('MedicalTreatment', MedicalTreatmentSchema)) as any;

