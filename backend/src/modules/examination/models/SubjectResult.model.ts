import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISubjectResult extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  examinationId: mongoose.Types.ObjectId;
  studentResultId: mongoose.Types.ObjectId; // Parent overall result
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  componentBreakdown: Array<{
    componentId: mongoose.Types.ObjectId;
    marksObtained: number;
    maxMarks: number;
    weightedMarks: number;
  }>;
  totalObtained: number;
  totalMaxMarks: number;
  percentage: number;
  grade: string;          // e.g., A+
  gradePoint: number;     // e.g., 4.0
  isPassed: boolean;
  isAbsent: boolean;
  remarks?: string;
  version: number;        // For result versioning
}

const SubjectResultSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    examinationId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true, index: true },
    studentResultId: { type: Schema.Types.ObjectId, ref: 'StudentResult', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    componentBreakdown: [
      {
        componentId: { type: Schema.Types.ObjectId, ref: 'AssessmentComponent' },
        marksObtained: Number,
        maxMarks: Number,
        weightedMarks: Number,
      },
    ],
    totalObtained: { type: Number, required: true },
    totalMaxMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true },
    gradePoint: { type: Number, required: true },
    isPassed: { type: Boolean, required: true },
    isAbsent: { type: Boolean, default: false },
    remarks: String,
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

SubjectResultSchema.index(
  { tenantId: 1, examinationId: 1, studentId: 1, subjectId: 1, version: 1 },
  { unique: true }
);
SubjectResultSchema.plugin(softDeletePlugin);

export default (mongoose.models['SubjectResult'] || (mongoose.models['SubjectResult'] || mongoose.model<ISubjectResult>('SubjectResult', SubjectResultSchema)) as any) as any;
