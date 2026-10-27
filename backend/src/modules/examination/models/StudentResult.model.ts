import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type ResultStatus = 'DRAFT' | 'CALCULATED' | 'REVIEWED' | 'APPROVED' | 'PUBLISHED' | 'WITHHELD';
export type PromotionStatus = 'PROMOTED' | 'NOT_PROMOTED' | 'CONDITIONAL' | 'WITHHELD' | 'PENDING';

export interface IStudentResult extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  examinationId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  totalObtained: number;
  totalMaxMarks: number;
  percentage: number;
  overallGrade: string;
  overallGradePoint: number;
  gpa?: number;
  passedSubjects: number;
  failedSubjects: number;
  isOverallPassed: boolean;
  rank?: number;
  rankScope?: 'SECTION' | 'CLASS' | 'GRADE' | 'BRANCH';
  promotionStatus: PromotionStatus;
  promotionOverrideReason?: string;
  promotionOverrideByUserId?: mongoose.Types.ObjectId;
  status: ResultStatus;
  withheldReason?: string;
  publishedAt?: Date;
  version: number;
  calculationVersion: string; // Snapshot of grade system version used
}

const StudentResultSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    examinationId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    totalObtained: { type: Number, required: true },
    totalMaxMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    overallGrade: { type: String, required: true },
    overallGradePoint: { type: Number, required: true },
    gpa: Number,
    passedSubjects: { type: Number, default: 0 },
    failedSubjects: { type: Number, default: 0 },
    isOverallPassed: { type: Boolean, required: true },
    rank: Number,
    rankScope: { type: String, enum: ['SECTION', 'CLASS', 'GRADE', 'BRANCH'] },
    promotionStatus: {
      type: String,
      enum: ['PROMOTED', 'NOT_PROMOTED', 'CONDITIONAL', 'WITHHELD', 'PENDING'],
      default: 'PENDING',
    },
    promotionOverrideReason: String,
    promotionOverrideByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['DRAFT', 'CALCULATED', 'REVIEWED', 'APPROVED', 'PUBLISHED', 'WITHHELD'],
      default: 'DRAFT',
    },
    withheldReason: String,
    publishedAt: Date,
    version: { type: Number, default: 1 },
    calculationVersion: { type: String, required: true },
  },
  { timestamps: true }
);

StudentResultSchema.index(
  { tenantId: 1, examinationId: 1, studentId: 1, version: 1 },
  { unique: true }
);
StudentResultSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentResult'] || (mongoose.models['StudentResult'] || mongoose.model<IStudentResult>('StudentResult', StudentResultSchema)) as any) as any;
