import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISubmission extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  
  attemptNumber: number;
  
  // Submission Content
  content?: string;
  attachments?: string[];
  
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'LATE' | 'EVALUATED' | 'RETURNED' | 'RESUBMITTED';
  
  submittedAt?: Date;
  isLate: boolean;
  
  // Evaluation
  evaluation?: {
    marks?: number;
    grade?: string;
    generalFeedback?: string;
    privateFeedback?: string; // Teacher only notes
    rubricScores?: Array<{
      criterionId: mongoose.Types.ObjectId;
      score: number;
      feedback?: string;
    }>;
  };
  
  evaluatedBy?: mongoose.Types.ObjectId;
  evaluatedAt?: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
  
  attemptNumber: { type: Number, default: 1 },
  
  content: { type: String },
  attachments: [{ type: String }],
  
  status: { 
    type: String, 
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'LATE', 'EVALUATED', 'RETURNED', 'RESUBMITTED'], 
    default: 'NOT_STARTED' 
  },
  
  submittedAt: { type: Date },
  isLate: { type: Boolean, default: false },
  
  evaluation: {
    marks: { type: Number },
    grade: { type: String },
    generalFeedback: { type: String },
    privateFeedback: { type: String },
    rubricScores: [{
      criterionId: { type: Schema.Types.ObjectId },
      score: { type: Number },
      feedback: { type: String }
    }]
  },
  
  evaluatedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  evaluatedAt: { type: Date }
}, {
  timestamps: true
});

SubmissionSchema.plugin(softDeletePlugin);

// A student can have multiple attempts, so unique index on tenant, assignment, student, attempt
SubmissionSchema.index({ tenantId: 1, assignmentId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });

// Index for listing submissions by status
SubmissionSchema.index({ tenantId: 1, assignmentId: 1, status: 1 });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
