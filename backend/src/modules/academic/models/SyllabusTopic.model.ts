import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISyllabusTopic extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  syllabusId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  sequence: number;
  learningObjective?: string;
  resources?: string[]; // Links or Object Storage keys
  
  // Progress Tracking Details
  isCompleted: boolean;
  plannedCompletionDate?: Date;
  actualCompletionDate?: Date;
  completedByTeacherId?: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId; // Tracks completion per section
}

const SyllabusTopicSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    syllabusId: { type: Schema.Types.ObjectId, ref: 'Syllabus', required: true, index: true },
    title: { type: String, required: true },
    description: String,
    sequence: { type: Number, required: true },
    learningObjective: String,
    resources: [{ type: String }],
    
    isCompleted: { type: Boolean, default: false },
    plannedCompletionDate: Date,
    actualCompletionDate: Date,
    completedByTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
  },
  {
    timestamps: true,
  }
);

// Sequence must be unique per syllabus
SyllabusTopicSchema.index({ syllabusId: 1, sequence: 1 }, { unique: true });
// If tracking completion per section, this prevents duplicate progress tracking records
SyllabusTopicSchema.index({ syllabusId: 1, sequence: 1, sectionId: 1 }, { unique: true });
SyllabusTopicSchema.plugin(softDeletePlugin);

export default (mongoose.models['SyllabusTopic'] || (mongoose.models['SyllabusTopic'] || mongoose.model<ISyllabusTopic>('SyllabusTopic', SyllabusTopicSchema)) as any) as any;
