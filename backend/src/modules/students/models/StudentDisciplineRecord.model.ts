import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentDisciplineRecord extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  incidentDate: Date;
  incidentType: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  description: string;
  actionTaken: string;
  reportedByUserId: mongoose.Types.ObjectId;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  parentNotified: boolean;
  notificationDate?: Date;
}

const StudentDisciplineRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    incidentDate: { type: Date, required: true },
    incidentType: { type: String, required: true },
    severity: {
      type: String,
      enum: ['MINOR', 'MODERATE', 'SEVERE', 'CRITICAL'],
      required: true
    },
    description: { type: String, required: true },
    actionTaken: { type: String, required: true },
    reportedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'OPEN'
    },
    resolution: String,
    parentNotified: { type: Boolean, default: false },
    notificationDate: Date,
  },
  { timestamps: true }
);

StudentDisciplineRecordSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentDisciplineRecord'] || (mongoose.models['StudentDisciplineRecord'] || mongoose.model<IStudentDisciplineRecord>('StudentDisciplineRecord', StudentDisciplineRecordSchema)) as any) as any;
