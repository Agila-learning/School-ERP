import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssignment extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  instructions?: string;
  type: 'HOMEWORK' | 'CLASSWORK' | 'PROJECT' | 'QUIZ' | 'PRACTICAL' | 'ACTIVITY' | 'CUSTOM';
  
  // Targeting
  classId: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId; // Optional: if null, applies to all sections
  studentIds?: mongoose.Types.ObjectId[]; // Optional: for specific students
  
  // Academic Linking
  subjectId: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  
  teacherId: mongoose.Types.ObjectId;
  
  // Timings
  assignedDate: Date;
  startDate?: Date;
  dueDate: Date;
  
  // Evaluation Rules
  maxMarks: number;
  passingMarks?: number;
  
  // Submission Rules
  submissionType: 'ONLINE_TEXT' | 'FILE_UPLOAD' | 'OFFLINE';
  allowLateSubmission: boolean;
  lateSubmissionDeadline?: Date;
  allowResubmission: boolean;
  maxAttempts: number;
  
  attachments?: string[]; // Array of file URLs or keys
  
  status: 'DRAFT' | 'PUBLISHED' | 'OPEN' | 'CLOSED' | 'ARCHIVED';
}

const AssignmentSchema = new Schema<IAssignment>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructions: { type: String },
  type: { 
    type: String, 
    enum: ['HOMEWORK', 'CLASSWORK', 'PROJECT', 'QUIZ', 'PRACTICAL', 'ACTIVITY', 'CUSTOM'],
    default: 'HOMEWORK'
  },
  
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'StudentProfile' }],
  
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'SyllabusTopic' }, // Note: assuming SyllabusTopic covers Chapters/Topics
  topicId: { type: Schema.Types.ObjectId, ref: 'SyllabusTopic' },
  
  teacherId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  
  assignedDate: { type: Date, default: Date.now },
  startDate: { type: Date },
  dueDate: { type: Date, required: true },
  
  maxMarks: { type: Number, required: true, default: 100 },
  passingMarks: { type: Number },
  
  submissionType: { type: String, enum: ['ONLINE_TEXT', 'FILE_UPLOAD', 'OFFLINE'], default: 'OFFLINE' },
  allowLateSubmission: { type: Boolean, default: false },
  lateSubmissionDeadline: { type: Date },
  allowResubmission: { type: Boolean, default: false },
  maxAttempts: { type: Number, default: 1 },
  
  attachments: [{ type: String }],
  
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'OPEN', 'CLOSED', 'ARCHIVED'], default: 'DRAFT' }
}, {
  timestamps: true
});

AssignmentSchema.plugin(softDeletePlugin);
AssignmentSchema.index({ tenantId: 1, classId: 1, sectionId: 1, subjectId: 1 });
AssignmentSchema.index({ tenantId: 1, teacherId: 1 });
AssignmentSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
