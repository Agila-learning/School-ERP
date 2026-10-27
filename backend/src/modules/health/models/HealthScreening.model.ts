import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHealthScreeningProgram extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  academicYearId: mongoose.Types.ObjectId;
  applicableGrades?: string[];
  startDate: Date;
  endDate: Date;
  providerId?: mongoose.Types.ObjectId; // Link to HealthProvider
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface IHealthScreeningSession extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  programId: mongoose.Types.ObjectId;
  date: Date;
  location: string;
  providerId?: mongoose.Types.ObjectId;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface IHealthScreeningResult extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  screeningType: 'VISION' | 'HEARING' | 'DENTAL' | 'PHYSICAL' | 'BMI' | 'OTHER';
  date: Date;
  measurements?: any; // Flexible for left/right eye, hearing hz, height/weight
  observations?: string;
  result: 'NORMAL' | 'ABNORMAL' | 'REQUIRES_ATTENTION' | 'CRITICAL';
  recommendation?: string;
  referralRequired: boolean;
  followUpRequired: boolean;
}

const HealthScreeningProgramSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  name: { type: String, required: true },
  academicYearId: { type: Schema.Types.Mixed, required: false },
  applicableGrades: [String],
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date, required: true },
  providerId: { type: Schema.Types.Mixed, ref: 'HealthProvider' },
  status: { type: String, enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'PLANNED' },
}, { timestamps: true });

const HealthScreeningSessionSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  programId: { type: Schema.Types.Mixed, ref: 'HealthScreeningProgram', required: true },
  date: { type: Date, required: true, default: Date.now },
  location: { type: String, required: true },
  providerId: { type: Schema.Types.Mixed, ref: 'HealthProvider' },
  status: { type: String, enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
}, { timestamps: true });

const HealthScreeningResultSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  sessionId: { type: Schema.Types.Mixed, ref: 'HealthScreeningSession', required: false },
  screeningType: { type: String, enum: ['VISION', 'HEARING', 'DENTAL', 'PHYSICAL', 'BMI', 'OTHER'], required: true },
  date: { type: Date, required: true, default: Date.now },
  measurements: Schema.Types.Mixed,
  observations: String,
  result: { type: String, enum: ['NORMAL', 'ABNORMAL', 'REQUIRES_ATTENTION', 'CRITICAL'], default: 'NORMAL' },
  recommendation: String,
  referralRequired: { type: Boolean, default: false },
  followUpRequired: { type: Boolean, default: false },
}, { timestamps: true });

[HealthScreeningProgramSchema, HealthScreeningSessionSchema, HealthScreeningResultSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const HealthScreeningProgram = (mongoose.models['HealthScreeningProgram'] || mongoose.model<IHealthScreeningProgram>('HealthScreeningProgram', HealthScreeningProgramSchema)) as any;
export const HealthScreeningSession = (mongoose.models['HealthScreeningSession'] || mongoose.model<IHealthScreeningSession>('HealthScreeningSession', HealthScreeningSessionSchema)) as any;
export const HealthScreeningResult = (mongoose.models['HealthScreeningResult'] || mongoose.model<IHealthScreeningResult>('HealthScreeningResult', HealthScreeningResultSchema)) as any;

