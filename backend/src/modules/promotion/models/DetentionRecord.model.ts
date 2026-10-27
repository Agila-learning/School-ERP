import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IDetentionRecord extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  reason: string;
  failedCriteria: string[];
  attendancePercentage: number;
  overallPercentage?: number;
  decisionId: mongoose.Types.ObjectId;
  approvedByUserId: mongoose.Types.ObjectId;
  remarks: string;
}

const DetentionRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    reason: { type: String, required: true },
    failedCriteria: [{ type: String }],
    attendancePercentage: { type: Number, required: true },
    overallPercentage: { type: Number },
    decisionId: { type: Schema.Types.ObjectId, ref: 'PromotionDecision', required: true },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: String
  },
  { timestamps: true }
);

DetentionRecordSchema.plugin(softDeletePlugin);

export default (mongoose.models['DetentionRecord'] || mongoose.model<IDetentionRecord>('DetentionRecord', DetentionRecordSchema)) as any;
