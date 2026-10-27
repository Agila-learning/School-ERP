import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IExamTerm extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  name: string; // e.g., 'Term 1', 'Term 2', 'Spring Semester'
  startDate: Date;
  endDate: Date;
  weightage?: number; // e.g., Term 1 = 40%, Term 2 = 60%
  isActive: boolean;
}

const ExamTermSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    weightage: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ExamTermSchema.index({ tenantId: 1, academicYearId: 1, name: 1 }, { unique: true });
ExamTermSchema.plugin(softDeletePlugin);

export default (mongoose.models['ExamTerm'] || mongoose.model<IExamTerm>('ExamTerm', ExamTermSchema)) as any;
