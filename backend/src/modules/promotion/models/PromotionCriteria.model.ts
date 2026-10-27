import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPromotionCriteria extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  policyId: mongoose.Types.ObjectId;
  criteriaType: 'ATTENDANCE' | 'OVERALL_PERCENTAGE' | 'SUBJECT_PASS' | 'INTERNAL_ASSESSMENT' | 'FEE_CLEARANCE' | 'DISCIPLINARY';
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUAL' | 'PASS_FAIL';
  targetValue: number | string;
  isMandatory: boolean;
}

const PromotionCriteriaSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    policyId: { type: Schema.Types.ObjectId, ref: 'PromotionPolicy', required: true },
    criteriaType: { 
      type: String, 
      enum: ['ATTENDANCE', 'OVERALL_PERCENTAGE', 'SUBJECT_PASS', 'INTERNAL_ASSESSMENT', 'FEE_CLEARANCE', 'DISCIPLINARY'],
      required: true
    },
    operator: { type: String, enum: ['GREATER_THAN', 'LESS_THAN', 'EQUAL', 'PASS_FAIL'], required: true },
    targetValue: { type: Schema.Types.Mixed, required: true },
    isMandatory: { type: Boolean, default: true }
  },
  { timestamps: true }
);

PromotionCriteriaSchema.plugin(softDeletePlugin);

export default (mongoose.models['PromotionCriteria'] || mongoose.model<IPromotionCriteria>('PromotionCriteria', PromotionCriteriaSchema)) as any;
