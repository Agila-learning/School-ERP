import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISafetyTraining extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  trainingName: string;
  trainingType: 'Fire Safety' | 'First Aid' | 'Emergency Response' | 'Evacuation' | 'Security Awareness' | 'Laboratory Safety' | 'Transport Safety' | 'Hostel Safety' | 'Other';
  instructorDetails: string;
  dateConducted: Date;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface ISafetyTrainingParticipant extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  trainingId: mongoose.Types.ObjectId;
  personId: mongoose.Types.ObjectId;
  personType: 'Student' | 'Employee';
  attendance: boolean;
  completion: boolean;
  certificateUrl?: string;
  certificateExpiry?: Date;
}

export interface IBusinessContinuityPlan extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  planName: string;
  criticalServices: string[];
  keyPersonnelRoles: string[];
  alternativeLocationDetails?: string;
  dataBackupStrategy: string;
  recoveryProcedures: string;
  lastTestDate?: Date;
  nextTestDate?: Date;
  status: 'Draft' | 'Active' | 'Archived';
}

export interface ISafetyNotice extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  noticeType: 'Emergency Notice' | 'Safety Reminder' | 'Drill Notice' | 'Maintenance Closure' | 'Restricted Area' | 'Weather Warning' | 'Other';
  validFrom: Date;
  validUntil: Date;
  publishedByUserId: mongoose.Types.ObjectId;
}

const SafetyTrainingSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  trainingName: { type: String, required: true },
  trainingType: { type: String, required: true },
  instructorDetails: { type: String, required: true },
  dateConducted: { type: Date, required: true },
  status: { type: String, default: 'Scheduled' },
}, { timestamps: true });

const SafetyTrainingParticipantSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  trainingId: { type: Schema.Types.ObjectId, ref: 'SafetyTraining', required: true },
  personId: { type: Schema.Types.ObjectId, required: true },
  personType: { type: String, enum: ['Student', 'Employee'], required: true },
  attendance: { type: Boolean, default: false },
  completion: { type: Boolean, default: false },
  certificateUrl: String,
  certificateExpiry: Date,
}, { timestamps: true });

const BusinessContinuityPlanSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  planName: { type: String, required: true },
  criticalServices: [String],
  keyPersonnelRoles: [String],
  alternativeLocationDetails: String,
  dataBackupStrategy: { type: String, required: true },
  recoveryProcedures: { type: String, required: true },
  lastTestDate: Date,
  nextTestDate: Date,
  status: { type: String, default: 'Draft' },
}, { timestamps: true });

const SafetyNoticeSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  noticeType: { type: String, required: true },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  publishedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

[SafetyTrainingSchema, SafetyTrainingParticipantSchema, BusinessContinuityPlanSchema, SafetyNoticeSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const SafetyTraining = (mongoose.models['SafetyTraining'] || mongoose.model<ISafetyTraining>('SafetyTraining', SafetyTrainingSchema)) as any;
export const SafetyTrainingParticipant = (mongoose.models['SafetyTrainingParticipant'] || mongoose.model<ISafetyTrainingParticipant>('SafetyTrainingParticipant', SafetyTrainingParticipantSchema)) as any;
export const BusinessContinuityPlan = (mongoose.models['BusinessContinuityPlan'] || mongoose.model<IBusinessContinuityPlan>('BusinessContinuityPlan', BusinessContinuityPlanSchema)) as any;
export const SafetyNotice = (mongoose.models['SafetyNotice'] || mongoose.model<ISafetyNotice>('SafetyNotice', SafetyNoticeSchema)) as any;
