import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentHealthProfile extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  bloodGroup: string;
  heightCm?: number;
  weightKg?: number;
  basicHealthInfo?: string;
  status: 'ACTIVE' | 'INCOMPLETE' | 'NEEDS_REVIEW' | 'ARCHIVED';
  lastUpdated: Date;
}

export interface IStudentAllergy extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  type: 'FOOD' | 'MEDICATION' | 'ENVIRONMENTAL' | 'INSECT' | 'OTHER';
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  reaction: string;
  knownSince?: Date;
  actionRequired: string;
  emergencyInstructions?: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface IStudentMedicalCondition extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  condition: string;
  status: 'ACTIVE' | 'RESOLVED' | 'UNDER_REVIEW' | 'HISTORICAL';
  diagnosedDate?: Date;
  relevantInstructions?: string;
  emergencyInstructions?: string;
  supportingDocument?: string;
  verifiedByUserId?: mongoose.Types.ObjectId;
  lastReviewed: Date;
}

export interface IStudentVaccination extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  vaccine: string;
  dose: string;
  date: Date;
  provider?: string;
  batchNumber?: string;
  document?: string;
  status: 'COMPLETED' | 'PARTIAL' | 'PENDING' | 'NOT_AVAILABLE' | 'NOT_APPLICABLE';
}

export interface IHealthAccommodation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  type: 'PHYSICAL_ACTIVITY' | 'MEAL' | 'MEDICATION' | 'ACCESSIBILITY' | 'EMERGENCY' | 'OTHER';
  description: string;
  authorizedBy?: mongoose.Types.ObjectId;
}

export interface IEmergencyContactLog extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  contactName: string;
  relationship: string;
  contactMethod: 'CALL' | 'SMS' | 'WHATSAPP' | 'EMAIL' | 'OTHER';
  contactTime: Date;
  result: 'ANSWERED' | 'NO_ANSWER' | 'VOICEMAIL' | 'UNREACHABLE';
  staffId: mongoose.Types.ObjectId;
  remarks?: string;
}

const StudentHealthProfileSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'], default: 'UNKNOWN' },
  heightCm: Number,
  weightKg: Number,
  basicHealthInfo: String,
  status: { type: String, enum: ['ACTIVE', 'INCOMPLETE', 'NEEDS_REVIEW', 'ARCHIVED'], default: 'INCOMPLETE' },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

const StudentAllergySchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['FOOD', 'MEDICATION', 'ENVIRONMENTAL', 'INSECT', 'OTHER'], required: true },
  allergen: { type: String, required: true },
  severity: { type: String, enum: ['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'], required: true },
  reaction: { type: String, required: true },
  knownSince: Date,
  actionRequired: { type: String, required: true },
  emergencyInstructions: String,
  status: { type: String, enum: ['ACTIVE', 'RESOLVED'], default: 'ACTIVE' },
}, { timestamps: true });

const StudentMedicalConditionSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
  condition: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'RESOLVED', 'UNDER_REVIEW', 'HISTORICAL'], default: 'ACTIVE' },
  diagnosedDate: Date,
  relevantInstructions: String,
  emergencyInstructions: String,
  supportingDocument: String,
  verifiedByUserId: { type: Schema.Types.Mixed, ref: 'User' },
  lastReviewed: { type: Date, default: Date.now },
}, { timestamps: true });

const StudentVaccinationSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
  vaccine: { type: String, required: true },
  dose: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  provider: String,
  batchNumber: String,
  document: String,
  status: { type: String, enum: ['COMPLETED', 'PARTIAL', 'PENDING', 'NOT_AVAILABLE', 'NOT_APPLICABLE'], default: 'COMPLETED' },
}, { timestamps: true });

const HealthAccommodationSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['PHYSICAL_ACTIVITY', 'MEAL', 'MEDICATION', 'ACCESSIBILITY', 'EMERGENCY', 'OTHER'], required: true },
  description: { type: String, required: true },
  authorizedBy: { type: Schema.Types.Mixed, ref: 'User' },
}, { timestamps: true });

const EmergencyContactLogSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
  contactName: { type: String, required: true },
  relationship: { type: String, required: true },
  contactMethod: { type: String, enum: ['CALL', 'SMS', 'WHATSAPP', 'EMAIL', 'OTHER'], default: 'CALL' },
  contactTime: { type: Date, required: true, default: Date.now },
  result: { type: String, enum: ['ANSWERED', 'NO_ANSWER', 'VOICEMAIL', 'UNREACHABLE'], default: 'ANSWERED' },
  staffId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  remarks: String,
}, { timestamps: true });

[StudentHealthProfileSchema, StudentAllergySchema, StudentMedicalConditionSchema, StudentVaccinationSchema, HealthAccommodationSchema, EmergencyContactLogSchema].forEach(schema => {
  schema.plugin(softDeletePlugin);
});

export const StudentHealthProfile = (mongoose.models['StudentHealthProfile'] || mongoose.model<IStudentHealthProfile>('StudentHealthProfile', StudentHealthProfileSchema)) as any;
export const StudentAllergy = (mongoose.models['StudentAllergy'] || mongoose.model<IStudentAllergy>('StudentAllergy', StudentAllergySchema)) as any;
export const StudentMedicalCondition = (mongoose.models['StudentMedicalCondition'] || mongoose.model<IStudentMedicalCondition>('StudentMedicalCondition', StudentMedicalConditionSchema)) as any;
export const StudentVaccination = (mongoose.models['StudentVaccination'] || mongoose.model<IStudentVaccination>('StudentVaccination', StudentVaccinationSchema)) as any;
export const HealthAccommodation = (mongoose.models['HealthAccommodation'] || mongoose.model<IHealthAccommodation>('HealthAccommodation', HealthAccommodationSchema)) as any;
export const EmergencyContactLog = (mongoose.models['EmergencyContactLog'] || mongoose.model<IEmergencyContactLog>('EmergencyContactLog', EmergencyContactLogSchema)) as any;
