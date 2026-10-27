import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type MarksEntryStatus = 'PRESENT' | 'ABSENT' | 'EXEMPTED' | 'NOT_APPLICABLE';

export interface IMarksEntry extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  marksSheetId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  componentId: mongoose.Types.ObjectId; // Ref: AssessmentComponent
  marksObtained?: number;               // Undefined if ABSENT/EXEMPTED
  graceMarks: number;
  moderatedMarks?: number;
  finalMarks?: number;                  // = marksObtained + graceMarks + moderation
  attendanceStatus: MarksEntryStatus;
  remarks?: string;
  enteredByUserId: mongoose.Types.ObjectId;
}

const MarksEntrySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    marksSheetId: { type: Schema.Types.ObjectId, ref: 'MarksSheet', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    componentId: { type: Schema.Types.ObjectId, ref: 'AssessmentComponent', required: true },
    marksObtained: Number,
    graceMarks: { type: Number, default: 0 },
    moderatedMarks: Number,
    finalMarks: Number,
    attendanceStatus: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'EXEMPTED', 'NOT_APPLICABLE'],
      default: 'PRESENT',
    },
    remarks: String,
    enteredByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// One marks entry per student per component per marks sheet
MarksEntrySchema.index(
  { tenantId: 1, marksSheetId: 1, studentId: 1, componentId: 1 },
  { unique: true }
);
MarksEntrySchema.plugin(softDeletePlugin);

export default (mongoose.models['MarksEntry'] || (mongoose.models['MarksEntry'] || mongoose.model<IMarksEntry>('MarksEntry', MarksEntrySchema)) as any) as any;
