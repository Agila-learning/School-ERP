import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentMedicalProfile extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  emergencyInstructions?: string;
  doctorName?: string;
  doctorPhone?: string;
  hospitalName?: string;
  insuranceDetails?: string;
  lastUpdatedBy?: mongoose.Types.ObjectId;
}

const StudentMedicalProfileSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    allergies: [{ type: String }],
    medicalConditions: [{ type: String }],
    medications: [{ type: String }],
    emergencyInstructions: String,
    doctorName: String,
    doctorPhone: String,
    hospitalName: String,
    insuranceDetails: String,
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// One medical profile per student
StudentMedicalProfileSchema.index({ tenantId: 1, studentId: 1 }, { unique: true });
StudentMedicalProfileSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentMedicalProfile'] || (mongoose.models['StudentMedicalProfile'] || mongoose.model<IStudentMedicalProfile>('StudentMedicalProfile', StudentMedicalProfileSchema)) as any) as any;
