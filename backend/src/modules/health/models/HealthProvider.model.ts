import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHealthProvider extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  providerName: string;
  type: 'DOCTOR' | 'HOSPITAL' | 'CLINIC' | 'LABORATORY' | 'PHARMACY' | 'HEALTH_CAMP_PROVIDER' | 'OTHER';
  contactPhone: string;
  contactEmail?: string;
  address: string;
  specialization?: string;
  registrationDetails?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IHealthCamp extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  campName: string;
  providerId: mongoose.Types.ObjectId;
  date: Date;
  location: string;
  servicesProvided: string[];
  applicableGrades?: string[];
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface IHealthServiceContract extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  services: string[];
  costReference?: string;
  renewalDate?: Date;
  documentUrl?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
}

const HealthProviderSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  providerName: { type: String, required: true },
  type: { type: String, enum: ['DOCTOR', 'HOSPITAL', 'CLINIC', 'LABORATORY', 'PHARMACY', 'HEALTH_CAMP_PROVIDER', 'OTHER'], required: true },
  contactPhone: { type: String, required: true },
  contactEmail: String,
  address: { type: String, required: true },
  specialization: String,
  registrationDetails: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

const HealthCampSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  campName: { type: String, required: true },
  providerId: { type: Schema.Types.Mixed, ref: 'HealthProvider', required: false },
  date: { type: Date, required: true, default: Date.now },
  location: { type: String, required: true },
  servicesProvided: [String],
  applicableGrades: [String],
  status: { type: String, enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'PLANNED' },
}, { timestamps: true });

const HealthServiceContractSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  providerId: { type: Schema.Types.Mixed, ref: 'HealthProvider', required: false },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date, required: true },
  services: [String],
  costReference: String,
  renewalDate: Date,
  documentUrl: String,
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'TERMINATED'], default: 'ACTIVE' },
}, { timestamps: true });

[HealthProviderSchema, HealthCampSchema, HealthServiceContractSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const HealthProvider = (mongoose.models['HealthProvider'] || mongoose.model<IHealthProvider>('HealthProvider', HealthProviderSchema)) as any;
export const HealthCamp = (mongoose.models['HealthCamp'] || mongoose.model<IHealthCamp>('HealthCamp', HealthCampSchema)) as any;
export const HealthServiceContract = (mongoose.models['HealthServiceContract'] || mongoose.model<IHealthServiceContract>('HealthServiceContract', HealthServiceContractSchema)) as any;

