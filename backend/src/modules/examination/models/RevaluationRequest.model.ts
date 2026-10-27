import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IRevaluationRequest extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  marksEntryId: mongoose.Types.ObjectId;
  originalMarks: number;
  revisedMarks?: number;
  reason: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  evaluatorId?: mongoose.Types.ObjectId; // User/Teacher
  approvedById?: mongoose.Types.ObjectId;
  feePaid?: boolean;
}

const RevaluationRequestSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  examId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  marksEntryId: { type: Schema.Types.ObjectId, ref: 'MarksEntry', required: true },
  originalMarks: { type: Number, required: true },
  revisedMarks: Number,
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  evaluatorId: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedById: { type: Schema.Types.ObjectId, ref: 'User' },
  feePaid: { type: Boolean, default: false },
}, { timestamps: true });

RevaluationRequestSchema.index({ tenantId: 1, marksEntryId: 1 }, { unique: true }); // One request per marks entry at a time
RevaluationRequestSchema.plugin(softDeletePlugin);

export default (mongoose.models['RevaluationRequest'] || (mongoose.models['RevaluationRequest'] || mongoose.model<IRevaluationRequest>('RevaluationRequest', RevaluationRequestSchema)) as any) as any;
