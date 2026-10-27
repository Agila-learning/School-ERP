import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPromotionException extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  originalEligibility: string;
  requestedDecision: string;
  reason: string;
  supportingDocumentUrl?: string;
  requestedByUserId: mongoose.Types.ObjectId;
  approvedByUserId?: mongoose.Types.ObjectId;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const PromotionExceptionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    originalEligibility: { type: String, required: true },
    requestedDecision: { type: String, required: true },
    reason: { type: String, required: true },
    supportingDocumentUrl: String,
    requestedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
  },
  { timestamps: true }
);

PromotionExceptionSchema.plugin(softDeletePlugin);

export default (mongoose.models['PromotionException'] || mongoose.model<IPromotionException>('PromotionException', PromotionExceptionSchema)) as any;
