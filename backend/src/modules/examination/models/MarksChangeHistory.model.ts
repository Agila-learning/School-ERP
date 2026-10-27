import mongoose, { Document, Schema } from 'mongoose';

/**
 * Immutable audit trail for every marks change.
 * Never deleted — provides full history even after sheet is published.
 */
export interface IMarksChangeHistory extends Document {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  marksEntryId: mongoose.Types.ObjectId;
  marksSheetId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  componentId: mongoose.Types.ObjectId;
  oldMarks?: number;
  newMarks?: number;
  oldAttendanceStatus?: string;
  newAttendanceStatus?: string;
  changeType: 'CREATED' | 'UPDATED' | 'GRACE_APPLIED' | 'MODERATED' | 'UNLOCKED_CORRECTION';
  reason?: string;
  changedByUserId: mongoose.Types.ObjectId;
  approvedByUserId?: mongoose.Types.ObjectId;
}

const MarksChangeHistorySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    marksEntryId: { type: Schema.Types.ObjectId, ref: 'MarksEntry', required: true },
    marksSheetId: { type: Schema.Types.ObjectId, ref: 'MarksSheet', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    componentId: { type: Schema.Types.ObjectId, ref: 'AssessmentComponent', required: true },
    oldMarks: Number,
    newMarks: Number,
    oldAttendanceStatus: String,
    newAttendanceStatus: String,
    changeType: {
      type: String,
      enum: ['CREATED', 'UPDATED', 'GRACE_APPLIED', 'MODERATED', 'UNLOCKED_CORRECTION'],
      required: true,
    },
    reason: String,
    changedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

MarksChangeHistorySchema.index({ tenantId: 1, marksSheetId: 1, studentId: 1 });

// NO softDelete — audit history is never deleted
export default (mongoose.models['MarksChangeHistory'] || (mongoose.models['MarksChangeHistory'] || mongoose.model<IMarksChangeHistory>('MarksChangeHistory', MarksChangeHistorySchema)) as any) as any;
