import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IComponentConfig {
  componentId: mongoose.Types.ObjectId; // Ref: AssessmentComponent
  maxMarks: number;
  passMarks: number;
  weightagePercent: number; // e.g., 80 for 80%
  allowDecimals: boolean;
}

export interface ISubjectExamConfig extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  examinationId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  components: IComponentConfig[];
  totalMaxMarks: number;
  totalPassMarks: number;
  gradeSystemId?: mongoose.Types.ObjectId; // Override from exam default if needed
  creditHours?: number;
  overallPassRequired: boolean;
  eachComponentPassRequired: boolean;
}

const SubjectExamConfigSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    examinationId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    components: [
      {
        componentId: { type: Schema.Types.ObjectId, ref: 'AssessmentComponent', required: true },
        maxMarks: { type: Number, required: true },
        passMarks: { type: Number, required: true },
        weightagePercent: { type: Number, required: true },
        allowDecimals: { type: Boolean, default: false },
      },
    ],
    totalMaxMarks: { type: Number, required: true },
    totalPassMarks: { type: Number, required: true },
    gradeSystemId: { type: Schema.Types.ObjectId, ref: 'GradeSystem' },
    creditHours: Number,
    overallPassRequired: { type: Boolean, default: true },
    eachComponentPassRequired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SubjectExamConfigSchema.index(
  { tenantId: 1, examinationId: 1, subjectId: 1, classId: 1 },
  { unique: true }
);
SubjectExamConfigSchema.plugin(softDeletePlugin);

export default (mongoose.models['SubjectExamConfig'] || (mongoose.models['SubjectExamConfig'] || mongoose.model<ISubjectExamConfig>('SubjectExamConfig', SubjectExamConfigSchema)) as any) as any;
