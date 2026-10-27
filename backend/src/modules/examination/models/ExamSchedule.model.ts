import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IExamSchedule extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  examinationId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  examDate: Date;
  startTime: string; // "09:00"
  endTime: string;   // "12:00"
  durationMinutes: number;
  roomId?: mongoose.Types.ObjectId; // Ref: existing Room model
  invigilatorIds: mongoose.Types.ObjectId[]; // Ref: Employee
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
}

const ExamScheduleSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    examinationId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    examDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    invigilatorIds: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
    status: {
      type: String,
      enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

// One subject per class/section per exam — prevent double schedule
ExamScheduleSchema.index(
  { tenantId: 1, examinationId: 1, sectionId: 1, subjectId: 1 },
  { unique: true }
);
// Prevent room double-booking on same date/time
ExamScheduleSchema.index({ tenantId: 1, roomId: 1, examDate: 1, startTime: 1 });
ExamScheduleSchema.plugin(softDeletePlugin);

export default (mongoose.models['ExamSchedule'] || (mongoose.models['ExamSchedule'] || mongoose.model<IExamSchedule>('ExamSchedule', ExamScheduleSchema)) as any) as any;
