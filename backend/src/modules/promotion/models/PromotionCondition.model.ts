import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPromotionCondition extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  decisionId: mongoose.Types.ObjectId;
  conditionType: 'SUBJECT_RECOVERY' | 'SUPPLEMENTARY_EXAM' | 'ADDITIONAL_ASSIGNMENT' | 'REMEDIAL_PROGRAM' | 'ACADEMIC_REVIEW';
  subjectId?: mongoose.Types.ObjectId;
  deadline: Date;
  responsibleTeacherId?: mongoose.Types.ObjectId;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'VERIFIED';
  verifiedByUserId?: mongoose.Types.ObjectId;
  remarks?: string;
}

const PromotionConditionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    decisionId: { type: Schema.Types.ObjectId, ref: 'PromotionDecision', required: true },
    conditionType: {
      type: String,
      enum: ['SUBJECT_RECOVERY', 'SUPPLEMENTARY_EXAM', 'ADDITIONAL_ASSIGNMENT', 'REMEDIAL_PROGRAM', 'ACADEMIC_REVIEW'],
      required: true
    },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    deadline: { type: Date, required: true },
    responsibleTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'VERIFIED'], default: 'PENDING' },
    verifiedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: String
  },
  { timestamps: true }
);

PromotionConditionSchema.plugin(softDeletePlugin);

export default (mongoose.models['PromotionCondition'] || mongoose.model<IPromotionCondition>('PromotionCondition', PromotionConditionSchema)) as any;
