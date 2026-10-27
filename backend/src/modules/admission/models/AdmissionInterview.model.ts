import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAdmissionInterview extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  interviewerId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  location?: string;
  mode: 'In-person' | 'Online' | 'Phone';
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled' | 'No-show';
  remarks?: string;
}

const AdmissionInterviewSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'AdmissionApplication', required: true, index: true },
    interviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: String,
    mode: { type: String, enum: ['In-person', 'Online', 'Phone'], required: true },
    status: { 
      type: String, 
      enum: ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled', 'No-show'], 
      default: 'Scheduled' 
    },
    remarks: String,
  },
  {
    timestamps: true,
  }
);

AdmissionInterviewSchema.plugin(softDeletePlugin);

export default (mongoose.models['AdmissionInterview'] || (mongoose.models['AdmissionInterview'] || mongoose.model<IAdmissionInterview>('AdmissionInterview', AdmissionInterviewSchema)) as any) as any;
