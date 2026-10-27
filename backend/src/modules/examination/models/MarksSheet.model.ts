import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type MarksSheetStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'LOCKED'
  | 'VERIFIED'
  | 'PUBLISHED';

/**
 * One MarksSheet per exam + section + subject.
 * Acts as a state machine to prevent concurrent writes and enforce workflow.
 */
export interface IMarksSheet extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  examinationId: mongoose.Types.ObjectId;
  subjectExamConfigId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  enteredByUserId?: mongoose.Types.ObjectId;
  verifiedByUserId?: mongoose.Types.ObjectId;
  status: MarksSheetStatus;
  submittedAt?: Date;
  lockedAt?: Date;
  __v: number; // Mongoose version key for optimistic locking
}

const MarksSheetSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    examinationId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true, index: true },
    subjectExamConfigId: { type: Schema.Types.ObjectId, ref: 'SubjectExamConfig', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    enteredByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'LOCKED', 'VERIFIED', 'PUBLISHED'],
      default: 'NOT_STARTED',
    },
    submittedAt: Date,
    lockedAt: Date,
  },
  { timestamps: true, optimisticConcurrency: true }
);

// Unique per exam+section+subject — one sheet only
MarksSheetSchema.index(
  { tenantId: 1, examinationId: 1, sectionId: 1, subjectId: 1 },
  { unique: true }
);
MarksSheetSchema.plugin(softDeletePlugin);

export default (mongoose.models['MarksSheet'] || (mongoose.models['MarksSheet'] || mongoose.model<IMarksSheet>('MarksSheet', MarksSheetSchema)) as any) as any;
