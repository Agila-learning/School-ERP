import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IReportCard extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentResultId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  examinationId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classTeacherRemarks?: string;
  principalRemarks?: string;
  attendanceSummary?: {
    workingDays: number;
    present: number;
    absent: number;
    attendancePercent: number;
  };
  isPublished: boolean;
  publishedAt?: Date;
  version: number;
  previousVersionId?: mongoose.Types.ObjectId;
  generatedByUserId: mongoose.Types.ObjectId;
}

const ReportCardSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentResultId: { type: Schema.Types.ObjectId, ref: 'StudentResult', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    examinationId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    classTeacherRemarks: String,
    principalRemarks: String,
    attendanceSummary: {
      workingDays: Number,
      present: Number,
      absent: Number,
      attendancePercent: Number,
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    version: { type: Number, default: 1 },
    previousVersionId: { type: Schema.Types.ObjectId, ref: 'ReportCard' },
    generatedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ReportCardSchema.index({ tenantId: 1, examinationId: 1, studentId: 1, version: 1 }, { unique: true });
ReportCardSchema.plugin(softDeletePlugin);

export default (mongoose.models['ReportCard'] || (mongoose.models['ReportCard'] || mongoose.model<IReportCard>('ReportCard', ReportCardSchema)) as any) as any;
