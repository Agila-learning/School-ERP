import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

/**
 * One document per class/section/date.
 * All student statuses are stored as embedded sub-documents.
 * This allows one atomic write for the entire class — far more efficient
 * than one document per student per day.
 */

export type StudentAttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'EXCUSED'
  | 'ON_LEAVE'
  | 'HOLIDAY';

export interface IStudentAttendanceEntry {
  studentId: mongoose.Types.ObjectId;
  status: StudentAttendanceStatus;
  remarks?: string;
  leaveRequestId?: mongoose.Types.ObjectId;
}

export interface IStudentDailyAttendance extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  date: Date;
  entries: IStudentAttendanceEntry[];
  submittedBy: mongoose.Types.ObjectId;  // Teacher who submitted
  isLocked: boolean;
  lockedAt?: Date;
  lockedBy?: mongoose.Types.ObjectId;
  status: 'DRAFT' | 'SUBMITTED' | 'LOCKED';
}

const StudentAttendanceEntrySchema = new Schema(
  {
    studentId: { type: Schema.Types.Mixed, ref: 'StudentProfile', required: true },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED', 'ON_LEAVE', 'HOLIDAY'],
      required: true,
    },
    remarks: String,
    leaveRequestId: { type: Schema.Types.Mixed, ref: 'LeaveRequest' },
  },
  { _id: false }
);

const StudentDailyAttendanceSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    academicYearId: { type: Schema.Types.Mixed },
    classId: { type: Schema.Types.Mixed },
    sectionId: { type: Schema.Types.Mixed },
    date: { type: Date, required: true },
    entries: [StudentAttendanceEntrySchema],
    submittedBy: { type: Schema.Types.Mixed },
    isLocked: { type: Boolean, default: false },
    lockedAt: Date,
    lockedBy: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'LOCKED'], default: 'DRAFT' },
  },
  { timestamps: true }
);

// One attendance sheet per section per date
StudentDailyAttendanceSchema.index(
  { tenantId: 1, academicYearId: 1, sectionId: 1, date: 1 },
  { unique: true }
);
StudentDailyAttendanceSchema.index({ tenantId: 1, date: 1 });
StudentDailyAttendanceSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentDailyAttendance'] || (mongoose.models['StudentDailyAttendance'] || mongoose.model<IStudentDailyAttendance>('StudentDailyAttendance', StudentDailyAttendanceSchema)) as any) as any;
