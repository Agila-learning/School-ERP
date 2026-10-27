import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IExamType extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g., 'Unit Test', 'Mid-Term', 'Final Exam'
  code: string;
  description?: string;
  isActive: boolean;
}

const ExamTypeSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ExamTypeSchema.index({ tenantId: 1, code: 1 }, { unique: true });
ExamTypeSchema.plugin(softDeletePlugin);

export default (mongoose.models['ExamType'] || mongoose.model<IExamType>('ExamType', ExamTypeSchema)) as any;
