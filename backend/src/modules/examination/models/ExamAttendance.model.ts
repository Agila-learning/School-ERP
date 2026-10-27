import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IExamAttendance extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  examScheduleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXEMPTED' | 'MEDICAL' | 'MALPRACTICE' | 'DISQUALIFIED';
  markedByUserId: mongoose.Types.ObjectId;
  remarks?: string;
}

const ExamAttendanceSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    examScheduleId: { type: Schema.Types.ObjectId, ref: 'ExamSchedule', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'EXEMPTED', 'MEDICAL', 'MALPRACTICE', 'DISQUALIFIED'],
      required: true,
    },
    markedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: String,
  },
  { timestamps: true }
);

// One attendance record per student per exam schedule
ExamAttendanceSchema.index(
  { tenantId: 1, examScheduleId: 1, studentId: 1 },
  { unique: true }
);
ExamAttendanceSchema.plugin(softDeletePlugin);

export default (mongoose.models['ExamAttendance'] || (mongoose.models['ExamAttendance'] || mongoose.model<IExamAttendance>('ExamAttendance', ExamAttendanceSchema)) as any) as any;
