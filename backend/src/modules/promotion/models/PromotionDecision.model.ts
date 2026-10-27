import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPromotionDecision extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  currentClassId: mongoose.Types.ObjectId;
  currentSectionId: mongoose.Types.ObjectId;
  decision: 'PROMOTED' | 'CONDITIONALLY_PROMOTED' | 'DETAINED' | 'GRADUATED' | 'TRANSFERRED' | 'WITHDRAWN' | 'PENDING_SUPPLEMENTARY';
  policyId: mongoose.Types.ObjectId;
  approvedByUserId: mongoose.Types.ObjectId;
  remarks: string;
}

const PromotionDecisionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    currentClassId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    currentSectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    decision: {
      type: String,
      enum: ['PROMOTED', 'CONDITIONALLY_PROMOTED', 'DETAINED', 'GRADUATED', 'TRANSFERRED', 'WITHDRAWN', 'PENDING_SUPPLEMENTARY'],
      required: true
    },
    policyId: { type: Schema.Types.ObjectId, ref: 'PromotionPolicy', required: true },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: String
  },
  { timestamps: true }
);

PromotionDecisionSchema.plugin(softDeletePlugin);

export default (mongoose.models['PromotionDecision'] || mongoose.model<IPromotionDecision>('PromotionDecision', PromotionDecisionSchema)) as any;
