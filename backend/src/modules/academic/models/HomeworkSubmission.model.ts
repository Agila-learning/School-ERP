import mongoose, { Schema, Document } from 'mongoose';

export interface IHomeworkSubmission extends Document {
  tenantId: mongoose.Types.ObjectId;
  homeworkId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  
  content?: string;
  attachments?: string[];
  
  status: 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED';
  
  submittedAt?: Date;
  
  grade?: string;
  remarks?: string;
  gradedBy?: mongoose.Types.ObjectId;
  gradedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkSubmissionSchema = new Schema<IHomeworkSubmission>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  homeworkId: { type: Schema.Types.ObjectId, ref: 'Homework', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
  
  content: { type: String },
  attachments: [{ type: String }],
  
  status: { type: String, enum: ['PENDING', 'SUBMITTED', 'LATE', 'GRADED'], default: 'PENDING' },
  
  submittedAt: { type: Date },
  
  grade: { type: String },
  remarks: { type: String },
  gradedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  gradedAt: { type: Date }
}, {
  timestamps: true
});

// Ensure a student can only submit a particular homework once (or at least track the latest)
HomeworkSubmissionSchema.index({ tenantId: 1, homeworkId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IHomeworkSubmission>('HomeworkSubmission', HomeworkSubmissionSchema);
