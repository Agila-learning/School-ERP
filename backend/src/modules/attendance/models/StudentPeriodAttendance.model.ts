import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentPeriodAttendance extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  periodDefinitionId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;  // Employee who marked attendance
  date: Date;
  entries: Array<{
    studentId: mongoose.Types.ObjectId;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks?: string;
  }>;
  isLocked: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'LOCKED';
}

const StudentPeriodAttendanceSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    academicYearId: { type: Schema.Types.Mixed },
    classId: { type: Schema.Types.Mixed },
    sectionId: { type: Schema.Types.Mixed },
    subjectId: { type: Schema.Types.Mixed },
    periodDefinitionId: { type: Schema.Types.Mixed },
    teacherId: { type: Schema.Types.Mixed },
    date: { type: Date, required: true },
    entries: [
      {
        studentId: { type: Schema.Types.Mixed, ref: 'StudentProfile', required: true },
        status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], required: true },
        remarks: String,
        _id: false,
      },
    ],
    isLocked: { type: Boolean, default: false },
    status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'LOCKED'], default: 'DRAFT' },
  },
  { timestamps: true }
);

// One period attendance per section/period/subject/date
StudentPeriodAttendanceSchema.index(
  { tenantId: 1, sectionId: 1, periodDefinitionId: 1, subjectId: 1, date: 1 },
  { unique: true }
);
StudentPeriodAttendanceSchema.plugin(softDeletePlugin);
export default (mongoose.models['StudentPeriodAttendance'] || (mongoose.models['StudentPeriodAttendance'] || mongoose.model<IStudentPeriodAttendance>('StudentPeriodAttendance', StudentPeriodAttendanceSchema)) as any) as any;
