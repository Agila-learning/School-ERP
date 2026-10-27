import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPromotionRecord extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  previousEnrollmentId: mongoose.Types.ObjectId;
  newEnrollmentId?: mongoose.Types.ObjectId; // Empty if graduated or withdrawn
  previousClassId: mongoose.Types.ObjectId;
  newClassId?: mongoose.Types.ObjectId;
  type: 'PROMOTED' | 'RETAINED' | 'GRADUATED';
  promotedByUserId: mongoose.Types.ObjectId;
  remarks?: string;
  promotionDate: Date;
}

const PromotionRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    previousEnrollmentId: { type: Schema.Types.ObjectId, ref: 'AcademicEnrollment', required: true },
    newEnrollmentId: { type: Schema.Types.ObjectId, ref: 'AcademicEnrollment' },
    previousClassId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    newClassId: { type: Schema.Types.ObjectId, ref: 'Class' },
    type: { type: String, enum: ['PROMOTED', 'RETAINED', 'GRADUATED'], required: true },
    promotedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: String,
    promotionDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

PromotionRecordSchema.plugin(softDeletePlugin);

export default (mongoose.models['PromotionRecord'] || (mongoose.models['PromotionRecord'] || mongoose.model<IPromotionRecord>('PromotionRecord', PromotionRecordSchema)) as any) as any;
