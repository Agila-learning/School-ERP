import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPromotionHistory extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  fromAcademicYearId: mongoose.Types.ObjectId;
  fromClassId: mongoose.Types.ObjectId;
  fromSectionId: mongoose.Types.ObjectId;
  toAcademicYearId: mongoose.Types.ObjectId;
  toClassId?: mongoose.Types.ObjectId;
  toSectionId?: mongoose.Types.ObjectId;
  decision: string;
  decisionDate: Date;
  approvedByUserId: mongoose.Types.ObjectId;
  reason: string;
}

const PromotionHistorySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    fromAcademicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    fromClassId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    fromSectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    toAcademicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    toClassId: { type: Schema.Types.ObjectId, ref: 'Class' },
    toSectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
    decision: { type: String, required: true },
    decisionDate: { type: Date, required: true },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true }
  },
  { timestamps: true }
);

PromotionHistorySchema.plugin(softDeletePlugin);

export default (mongoose.models['PromotionHistory'] || mongoose.model<IPromotionHistory>('PromotionHistory', PromotionHistorySchema)) as any;
