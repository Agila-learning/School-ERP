import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IInterview extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  requisitionId: mongoose.Types.ObjectId;
  round: 'Screening' | 'Technical' | 'HR' | 'Management' | 'Demo Class';
  interviewerId: mongoose.Types.ObjectId; // Ref Employee
  scheduledDate: Date;
  timeSlot: string;
  mode: 'In-person' | 'Online' | 'Phone';
  locationOrLink?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  // Feedback
  technicalRating?: number; // 1-5
  communicationRating?: number; // 1-5
  roleSuitability?: number; // 1-5
  strengths?: string;
  weaknesses?: string;
  recommendation?: 'HIRE' | 'STRONG_HIRE' | 'NO_HIRE' | 'ON_HOLD';
  remarks?: string;
}

const InterviewSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  requisitionId: { type: Schema.Types.ObjectId, ref: 'JobRequisition', required: true },
  round: {
    type: String,
    enum: ['Screening', 'Technical', 'HR', 'Management', 'Demo Class'],
    required: true,
  },
  interviewerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  scheduledDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  mode: { type: String, enum: ['In-person', 'Online', 'Phone'], required: true },
  locationOrLink: String,
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED',
  },
  technicalRating: { type: Number, min: 1, max: 5 },
  communicationRating: { type: Number, min: 1, max: 5 },
  roleSuitability: { type: Number, min: 1, max: 5 },
  strengths: String,
  weaknesses: String,
  recommendation: {
    type: String,
    enum: ['HIRE', 'STRONG_HIRE', 'NO_HIRE', 'ON_HOLD'],
  },
  remarks: String,
}, { timestamps: true });

InterviewSchema.plugin(softDeletePlugin);

export default (mongoose.models['Interview'] || (mongoose.models['Interview'] || mongoose.model<IInterview>('Interview', InterviewSchema)) as any) as any;
