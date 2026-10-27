import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPromotionEligibility extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  policyId: mongoose.Types.ObjectId;
  eligibilityStatus: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'PENDING_SUPPLEMENTARY' | 'PENDING_REVIEW' | 'GRADUATING';
  attendanceStatus: 'MET' | 'FAILED';
  academicStatus: 'MET' | 'FAILED';
  reason: string;
  processedAt: Date;
}

const PromotionEligibilitySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    policyId: { type: Schema.Types.ObjectId, ref: 'PromotionPolicy', required: true },
    eligibilityStatus: { 
      type: String, 
      enum: ['ELIGIBLE', 'NOT_ELIGIBLE', 'CONDITIONALLY_ELIGIBLE', 'PENDING_SUPPLEMENTARY', 'PENDING_REVIEW', 'GRADUATING'],
      required: true 
    },
    attendanceStatus: { type: String, enum: ['MET', 'FAILED'], required: true },
    academicStatus: { type: String, enum: ['MET', 'FAILED'], required: true },
    reason: { type: String, required: true },
    processedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

PromotionEligibilitySchema.index({ tenantId: 1, studentId: 1, academicYearId: 1 }, { unique: true });
PromotionEligibilitySchema.plugin(softDeletePlugin);

export default (mongoose.models['PromotionEligibility'] || mongoose.model<IPromotionEligibility>('PromotionEligibility', PromotionEligibilitySchema)) as any;
