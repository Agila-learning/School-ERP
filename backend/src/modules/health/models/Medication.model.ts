import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IMedicalMedication extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  medicationName: string;
  genericName?: string;
  form: string;
  strength: string;
  unit: string;
  category: string;
  storageRequirement?: string;
  inventoryItemId?: mongoose.Types.ObjectId; // Links to Phase 48
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
}

export interface IMedicalPrescription extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  prescriberName: string;
  date: Date;
  medicationId: mongoose.Types.ObjectId;
  instructions: string;
  durationDays?: number;
  documentUrl?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface IMedicationAdministration extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  medicationId: mongoose.Types.ObjectId;
  dose: string;
  route: string;
  scheduledTime?: Date;
  actualTime?: Date;
  administeredByUserId: mongoose.Types.ObjectId;
  reason?: string;
  prescriptionId?: mongoose.Types.ObjectId;
  status: 'SCHEDULED' | 'ADMINISTERED' | 'MISSED' | 'REFUSED' | 'CANCELLED';
  remarks?: string;
}

const MedicalMedicationSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  medicationName: { type: String, required: true },
  genericName: String,
  form: { type: String, required: true },
  strength: { type: String, required: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
  storageRequirement: String,
  inventoryItemId: { type: Schema.Types.Mixed, ref: 'InventoryItem' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'], default: 'ACTIVE' },
}, { timestamps: true });

const MedicalPrescriptionSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  prescriberName: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  medicationId: { type: Schema.Types.Mixed, ref: 'MedicalMedication', required: false },
  instructions: { type: String, required: true },
  durationDays: Number,
  documentUrl: String,
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE' },
}, { timestamps: true });

const MedicationAdministrationSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  medicationId: { type: Schema.Types.Mixed, ref: 'MedicalMedication', required: false },
  dose: { type: String, required: true },
  route: { type: String, required: true },
  scheduledTime: Date,
  actualTime: Date,
  administeredByUserId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  reason: String,
  prescriptionId: { type: Schema.Types.Mixed, ref: 'MedicalPrescription' },
  status: { type: String, enum: ['SCHEDULED', 'ADMINISTERED', 'MISSED', 'REFUSED', 'CANCELLED'], default: 'SCHEDULED' },
  remarks: String,
}, { timestamps: true });

[MedicalMedicationSchema, MedicalPrescriptionSchema, MedicationAdministrationSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const MedicalMedication = (mongoose.models['MedicalMedication'] || mongoose.model<IMedicalMedication>('MedicalMedication', MedicalMedicationSchema)) as any;
export const MedicalPrescription = (mongoose.models['MedicalPrescription'] || mongoose.model<IMedicalPrescription>('MedicalPrescription', MedicalPrescriptionSchema)) as any;
export const MedicationAdministration = (mongoose.models['MedicationAdministration'] || mongoose.model<IMedicationAdministration>('MedicationAdministration', MedicationAdministrationSchema)) as any;
