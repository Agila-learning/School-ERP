import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILessonPlan extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  title: string;
  subjectId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  objectives: string;
  materials: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
}

const LessonPlanSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: true },
    subjectId: { type: Schema.Types.Mixed, ref: 'Subject', required: true },
    classId: { type: Schema.Types.Mixed, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.Mixed, ref: 'Section' },
    teacherId: { type: Schema.Types.Mixed, ref: 'User', required: true },
    weekStartDate: { type: Date, required: true },
    objectives: { type: String, required: true },
    materials: { type: [String], default: [] },
    status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED'], default: 'DRAFT' },
  },
  { timestamps: true }
);

LessonPlanSchema.plugin(softDeletePlugin);

export default (mongoose.models['LessonPlan'] || mongoose.model<ILessonPlan>('LessonPlan', LessonPlanSchema)) as any;

