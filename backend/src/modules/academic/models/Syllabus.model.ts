import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISyllabus extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  curriculumId: mongoose.Types.ObjectId; // Maps to a specific AcademicYear + Class + Subject
  title: string;
  description?: string;
  sequence: number; // For ordering (e.g., Unit 1, Unit 2)
  estimatedTeachingHours: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const SyllabusSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    curriculumId: { type: Schema.Types.ObjectId, ref: 'Curriculum', required: true, index: true },
    title: { type: String, required: true },
    description: String,
    sequence: { type: Number, required: true },
    estimatedTeachingHours: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

SyllabusSchema.index({ curriculumId: 1, sequence: 1 }, { unique: true });
SyllabusSchema.plugin(softDeletePlugin);

export default (mongoose.models['Syllabus'] || (mongoose.models['Syllabus'] || mongoose.model<ISyllabus>('Syllabus', SyllabusSchema)) as any) as any;
