import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type ExamStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'MARKS_ENTRY'
  | 'VALIDATION'
  | 'RESULT_READY'
  | 'APPROVAL_PENDING'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'CANCELLED';

// ExamType is now a dynamic collection (ExamType.model.ts)

export interface IExaminationMaster extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  termId?: mongoose.Types.ObjectId;
  name: string;
  code: string;
  examTypeId: mongoose.Types.ObjectId;
  description?: string;
  startDate: Date;
  endDate: Date;
  resultPublishDate?: Date;
  gradeSystemId: mongoose.Types.ObjectId;
  applicableClassIds: mongoose.Types.ObjectId[];
  status: ExamStatus;
  createdByUserId: mongoose.Types.ObjectId;
  approvedByUserId?: mongoose.Types.ObjectId;
}

const ExaminationMasterSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    termId: { type: Schema.Types.ObjectId, ref: 'ExamTerm' },
    name: { type: String, required: true },
    code: { type: String, required: true },
    examTypeId: { type: Schema.Types.ObjectId, ref: 'ExamType', required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    resultPublishDate: Date,
    gradeSystemId: { type: Schema.Types.ObjectId, ref: 'GradeSystem', required: true },
    applicableClassIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    status: {
      type: String,
      enum: ['DRAFT', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'MARKS_ENTRY', 'VALIDATION', 'RESULT_READY', 'APPROVAL_PENDING', 'PUBLISHED', 'ARCHIVED', 'CANCELLED'],
      default: 'DRAFT',
    },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ExaminationMasterSchema.index({ tenantId: 1, academicYearId: 1, code: 1 }, { unique: true });
ExaminationMasterSchema.plugin(softDeletePlugin);

export default (mongoose.models['ExaminationMaster'] || (mongoose.models['ExaminationMaster'] || mongoose.model<IExaminationMaster>('ExaminationMaster', ExaminationMasterSchema)) as any) as any;
