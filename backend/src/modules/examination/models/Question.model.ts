import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type QuestionType = 'MCQ' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'ESSAY' | 'MATCHING' | 'NUMERICAL' | 'PRACTICAL' | 'DIAGRAM' | 'CODING' | 'ORAL' | 'OTHER';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
export type BloomLevel = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';

export interface IQuestionOption {
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface IQuestion extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  questionBankId: mongoose.Types.ObjectId;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  bloomLevel?: BloomLevel;
  text: string;
  imageUrl?: string;
  marks: number;
  negativeMarks?: number;
  options?: IQuestionOption[];
  correctAnswerText?: string; // for fill-in-blank, short answer
  explanation?: string;
  chapter?: string;
  topic?: string;
  learningOutcome?: string;
  tags: string[];
  language: string;
  createdBy: mongoose.Types.ObjectId;
  status: 'DRAFT' | 'APPROVED' | 'ARCHIVED';
}

const QuestionSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  questionBankId: { type: Schema.Types.ObjectId, ref: 'QuestionBank', required: true, index: true },
  type: {
    type: String,
    enum: ['MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'FILL_IN_BLANK', 'SHORT_ANSWER', 'LONG_ANSWER', 'ESSAY', 'MATCHING', 'NUMERICAL', 'PRACTICAL', 'DIAGRAM', 'CODING', 'ORAL', 'OTHER'],
    required: true,
  },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD', 'VERY_HARD'], required: true },
  bloomLevel: { type: String, enum: ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'] },
  text: { type: String, required: true },
  imageUrl: String,
  marks: { type: Number, required: true, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  options: [{
    text: String,
    isCorrect: Boolean,
    order: Number,
  }],
  correctAnswerText: String,
  explanation: String,
  chapter: String,
  topic: String,
  learningOutcome: String,
  tags: [{ type: String }],
  language: { type: String, default: 'English' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['DRAFT', 'APPROVED', 'ARCHIVED'], default: 'DRAFT' },
}, { timestamps: true });

QuestionSchema.plugin(softDeletePlugin);

export default (mongoose.models['Question'] || (mongoose.models['Question'] || mongoose.model<IQuestion>('Question', QuestionSchema)) as any) as any;
