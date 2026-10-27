import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IExamInvigilator extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId; // Ref ExamSchedule
  roomId: mongoose.Types.ObjectId; // Ref ExamRoom
  staffId: mongoose.Types.ObjectId; // Ref User/Employee
  role: 'PRIMARY' | 'ASSISTANT' | 'CHIEF' | 'COORDINATOR';
  status: 'ASSIGNED' | 'CONFIRMED' | 'REJECTED' | 'ATTENDED' | 'ABSENT';
}

const ExamInvigilatorSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  examId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true, index: true },
  scheduleId: { type: Schema.Types.ObjectId, ref: 'ExamSchedule', required: true, index: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'ExamRoom', required: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['PRIMARY', 'ASSISTANT', 'CHIEF', 'COORDINATOR'], default: 'PRIMARY' },
  status: { type: String, enum: ['ASSIGNED', 'CONFIRMED', 'REJECTED', 'ATTENDED', 'ABSENT'], default: 'ASSIGNED' },
}, { timestamps: true });

// Prevent same staff assigned to same schedule twice
ExamInvigilatorSchema.index({ tenantId: 1, scheduleId: 1, staffId: 1 }, { unique: true });
ExamInvigilatorSchema.plugin(softDeletePlugin);

export default (mongoose.models['ExamInvigilator'] || (mongoose.models['ExamInvigilator'] || mongoose.model<IExamInvigilator>('ExamInvigilator', ExamInvigilatorSchema)) as any) as any;
