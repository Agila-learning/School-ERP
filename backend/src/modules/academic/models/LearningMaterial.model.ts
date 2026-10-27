import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILearningMaterial extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  
  type: 'PDF' | 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'PRESENTATION' | 'LINK' | 'NOTE';
  
  // Material Content (Either a URL, an external link, or rich text note)
  url?: string;
  content?: string; // Used if type is NOTE
  
  // Academic Linking
  subjectId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  
  teacherId: mongoose.Types.ObjectId;
  
  publishDate?: Date;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

const LearningMaterialSchema = new Schema<ILearningMaterial>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  
  type: { 
    type: String, 
    enum: ['PDF', 'DOCUMENT', 'IMAGE', 'VIDEO', 'PRESENTATION', 'LINK', 'NOTE'],
    required: true
  },
  
  url: { type: String },
  content: { type: String },
  
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
  chapterId: { type: Schema.Types.ObjectId, ref: 'SyllabusTopic' },
  topicId: { type: Schema.Types.ObjectId, ref: 'SyllabusTopic' },
  
  teacherId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  
  publishDate: { type: Date },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' }
}, {
  timestamps: true
});

LearningMaterialSchema.plugin(softDeletePlugin);

LearningMaterialSchema.index({ tenantId: 1, classId: 1, subjectId: 1 });
LearningMaterialSchema.index({ tenantId: 1, teacherId: 1 });

export default mongoose.model<ILearningMaterial>('LearningMaterial', LearningMaterialSchema);
