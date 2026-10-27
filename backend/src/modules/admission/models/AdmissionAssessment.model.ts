import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAdmissionAssessment extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  assessmentType: string; // e.g. 'Written Test', 'Interaction'
  subject?: string;
  evaluatorId: mongoose.Types.ObjectId;
  maximumScore?: number;
  score?: number;
  result: 'Pass' | 'Fail' | 'Pending';
  remarks?: string;
}

const AdmissionAssessmentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'AdmissionApplication', required: true, index: true },
    assessmentType: { type: String, required: true },
    subject: String,
    evaluatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    maximumScore: Number,
    score: Number,
    result: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' },
    remarks: String,
  },
  {
    timestamps: true,
  }
);

AdmissionAssessmentSchema.plugin(softDeletePlugin);

export default (mongoose.models['AdmissionAssessment'] || (mongoose.models['AdmissionAssessment'] || mongoose.model<IAdmissionAssessment>('AdmissionAssessment', AdmissionAssessmentSchema)) as any) as any;
