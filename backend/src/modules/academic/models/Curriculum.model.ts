import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ICurriculum extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  name: string;
  weeklyPeriods: number;
  maximumMarks: number;
  passingMarks: number;
  credits?: number;
  learningObjectives?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const CurriculumSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    name: { type: String, required: true },
    weeklyPeriods: { type: Number, required: true, default: 0 },
    maximumMarks: { type: Number, required: true, default: 100 },
    passingMarks: { type: Number, required: true, default: 40 },
    credits: { type: Number, default: 0 },
    learningObjectives: String,
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

CurriculumSchema.index({ tenantId: 1, academicYearId: 1, classId: 1, subjectId: 1 }, { unique: true });
CurriculumSchema.plugin(softDeletePlugin);

export default (mongoose.models['Curriculum'] || (mongoose.models['Curriculum'] || mongoose.model<ICurriculum>('Curriculum', CurriculumSchema)) as any) as any;
