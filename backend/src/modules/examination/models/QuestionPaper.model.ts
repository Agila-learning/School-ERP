import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IQuestionPaperBlueprint {
  totalQuestions: number;
  totalMarks: number;
  difficultyDistribution: {
    EASY: number; // percentage
    MEDIUM: number;
    HARD: number;
  };
  typeDistribution: {
    type: string;
    percentage: number;
  }[];
  chapterDistribution: {
    chapter: string;
    percentage: number;
  }[];
}

export interface IQuestionPaper extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId; // Ref ExaminationMaster
  subjectId: mongoose.Types.ObjectId;
  title: string;
  instructions?: string;
  totalMarks: number;
  durationMinutes: number;
  blueprint?: IQuestionPaperBlueprint;
  version: number;
  status: 'DRAFT' | 'GENERATED' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
}

export interface IQuestionPaperItem extends Document {
  tenantId: mongoose.Types.ObjectId;
  questionPaperId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  section?: string; // e.g., "Section A", "Section B"
  order: number;
  marksOverride?: number;
}

const QuestionPaperSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  examId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true, index: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  instructions: String,
  totalMarks: { type: Number, required: true },
  durationMinutes: { type: Number, required: true },
  blueprint: {
    totalQuestions: Number,
    totalMarks: Number,
    difficultyDistribution: { EASY: Number, MEDIUM: Number, HARD: Number },
    typeDistribution: [{ type: { type: String }, percentage: Number }],
    chapterDistribution: [{ chapter: String, percentage: Number }]
  },
  version: { type: Number, default: 1, required: true },
  status: { type: String, enum: ['DRAFT', 'GENERATED', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

QuestionPaperSchema.index({ tenantId: 1, examId: 1, subjectId: 1, version: 1 }, { unique: true });
QuestionPaperSchema.plugin(softDeletePlugin);

const QuestionPaperItemSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  questionPaperId: { type: Schema.Types.ObjectId, ref: 'QuestionPaper', required: true, index: true },
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  section: String,
  order: { type: Number, required: true },
  marksOverride: Number,
});

// Ensure uniqueness of a question within a paper
QuestionPaperItemSchema.index({ tenantId: 1, questionPaperId: 1, questionId: 1 }, { unique: true });

export const QuestionPaper = (mongoose.models['QuestionPaper'] || mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema)) as any;
export const QuestionPaperItem = (mongoose.models['QuestionPaperItem'] || mongoose.model<IQuestionPaperItem>('QuestionPaperItem', QuestionPaperItemSchema)) as any;
