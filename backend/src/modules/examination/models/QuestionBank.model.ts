import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IQuestionBank extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  subjectId: mongoose.Types.ObjectId;
  gradeId?: mongoose.Types.ObjectId;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  tags: string[];
}

const QuestionBankSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  gradeId: { type: Schema.Types.ObjectId, ref: 'Class' },
  description: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  tags: [{ type: String }],
}, { timestamps: true });

QuestionBankSchema.index({ tenantId: 1, code: 1 }, { unique: true });
QuestionBankSchema.plugin(softDeletePlugin);

export default (mongoose.models['QuestionBank'] || (mongoose.models['QuestionBank'] || mongoose.model<IQuestionBank>('QuestionBank', QuestionBankSchema)) as any) as any;
