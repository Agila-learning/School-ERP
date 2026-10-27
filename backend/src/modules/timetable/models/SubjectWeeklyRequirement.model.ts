import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISubjectWeeklyRequirement extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  requiredPeriodsPerWeek: number;
  isDoublePeriod: boolean;
}

const SubjectWeeklyRequirementSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    requiredPeriodsPerWeek: { type: Number, required: true, min: 1 },
    isDoublePeriod: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SubjectWeeklyRequirementSchema.index(
  { tenantId: 1, academicYearId: 1, classId: 1, subjectId: 1 },
  { unique: true }
);
SubjectWeeklyRequirementSchema.plugin(softDeletePlugin);
export default (mongoose.models['SubjectWeeklyRequirement'] || (mongoose.models['SubjectWeeklyRequirement'] || mongoose.model<ISubjectWeeklyRequirement>('SubjectWeeklyRequirement', SubjectWeeklyRequirementSchema)) as any) as any;
