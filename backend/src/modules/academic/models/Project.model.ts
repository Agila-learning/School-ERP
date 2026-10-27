import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IProject extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  classId: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId; // Who assigned it
  dueDate: Date;
  maxMarks: number;
}

const ProjectSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  maxMarks: { type: Number, default: 100 }
}, { timestamps: true });

ProjectSchema.plugin(softDeletePlugin);

export default (mongoose.models['Project'] || mongoose.model<IProject>('Project', ProjectSchema)) as any;
