import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IExamNotification extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  examinationId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  targetAudiences: ('STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN')[];
  sentAt?: Date;
  scheduledFor?: Date;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  createdByUserId: mongoose.Types.ObjectId;
}

const ExamNotificationSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    examinationId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetAudiences: [{ type: String, enum: ['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'] }],
    sentAt: Date,
    scheduledFor: Date,
    status: { type: String, enum: ['PENDING', 'SENT', 'FAILED', 'CANCELLED'], default: 'PENDING' },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ExamNotificationSchema.plugin(softDeletePlugin);

export default (mongoose.models['ExamNotification'] || mongoose.model<IExamNotification>('ExamNotification', ExamNotificationSchema)) as any;
