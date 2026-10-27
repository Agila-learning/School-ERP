import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssessment extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  type: 'UNIT_TEST' | 'QUIZ' | 'ASSIGNMENT' | 'PRACTICAL' | 'PROJECT' | 'ORAL';
  subject: string;
  class: string;
  totalMarks: number;
  duration?: number;
  scheduledAt?: Date;
  deadline?: Date;
  status: 'DRAFT' | 'ONGOING' | 'PUBLISHED' | 'GRADED';
  submittedCount: number;
  totalStudents: number;
  avgScore?: number;
  topScore?: number;
  passCount?: number;
}

const AssessmentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['UNIT_TEST', 'QUIZ', 'ASSIGNMENT', 'PRACTICAL', 'PROJECT', 'ORAL'], required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  duration: { type: Number },
  scheduledAt: { type: Date },
  deadline: { type: Date },
  status: { type: String, enum: ['DRAFT', 'ONGOING', 'PUBLISHED', 'GRADED'], default: 'DRAFT' },
  submittedCount: { type: Number, default: 0 },
  totalStudents: { type: Number, required: true, default: 0 },
  avgScore: { type: Number },
  topScore: { type: Number },
  passCount: { type: Number }
}, { timestamps: true });

AssessmentSchema.plugin(softDeletePlugin);

export default (mongoose.models['Assessment'] || mongoose.model<IAssessment>('Assessment', AssessmentSchema)) as any;
