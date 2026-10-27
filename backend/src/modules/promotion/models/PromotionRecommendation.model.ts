import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPromotionRecommendation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  currentClassId: mongoose.Types.ObjectId;
  currentSectionId: mongoose.Types.ObjectId;
  recommendedClassId?: mongoose.Types.ObjectId;
  recommendedSectionId?: mongoose.Types.ObjectId;
  status: 'DRAFT' | 'RECOMMENDED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'CANCELLED' | 'EXECUTED';
  reason: string;
  recommendedByUserId: mongoose.Types.ObjectId;
  approvedByUserId?: mongoose.Types.ObjectId;
}

const PromotionRecommendationSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    currentClassId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    currentSectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    recommendedClassId: { type: Schema.Types.ObjectId, ref: 'Class' },
    recommendedSectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
    status: {
      type: String,
      enum: ['DRAFT', 'RECOMMENDED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'MODIFIED', 'CANCELLED', 'EXECUTED'],
      default: 'DRAFT'
    },
    reason: String,
    recommendedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

PromotionRecommendationSchema.plugin(softDeletePlugin);

export default (mongoose.models['PromotionRecommendation'] || mongoose.model<IPromotionRecommendation>('PromotionRecommendation', PromotionRecommendationSchema)) as any;
