import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPromotionPolicy extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  academicYearId: mongoose.Types.ObjectId;
  applicableClassIds: mongoose.Types.ObjectId[];
  minAttendancePercentage: number;
  minOverallPercentage: number;
  minSubjectPassCount?: number;
  graceMarksAllowed: number;
  allowSupplementary: boolean;
  allowConditionalPromotion: boolean;
  version: number;
  previousVersionId?: mongoose.Types.ObjectId;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  effectiveDate: Date;
  createdByUserId: mongoose.Types.ObjectId;
  approvedByUserId?: mongoose.Types.ObjectId;
}

const PromotionPolicySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', default: () => new mongoose.Types.ObjectId(), index: true },
    applicableClassIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    minAttendancePercentage: { type: Number, required: true, default: 75 },
    minOverallPercentage: { type: Number, required: true, default: 40 },
    minSubjectPassCount: { type: Number, default: 5 },
    graceMarksAllowed: { type: Number, default: 0 },
    allowSupplementary: { type: Boolean, default: false },
    allowConditionalPromotion: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    previousVersionId: { type: Schema.Types.ObjectId, ref: 'PromotionPolicy' },
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
    effectiveDate: { type: Date, default: Date.now },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', default: () => new mongoose.Types.ObjectId() },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

PromotionPolicySchema.plugin(softDeletePlugin);

export default (mongoose.models['PromotionPolicy'] || mongoose.model<IPromotionPolicy>('PromotionPolicy', PromotionPolicySchema)) as any;
