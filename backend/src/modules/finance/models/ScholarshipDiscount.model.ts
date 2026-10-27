import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IScholarshipDiscount extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  feeHeadId?: mongoose.Types.ObjectId; // If null, applies to total invoice
  name: string; // e.g., Merit Scholarship, Sibling Discount
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  reason?: string;
  approvedByUserId?: mongoose.Types.ObjectId;
  isActive: boolean;
}

const ScholarshipDiscountSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear' },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', index: true },
    feeHeadId: { type: Schema.Types.ObjectId, ref: 'FeeHead' },
    name: { type: String, required: true },
    type: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
    value: { type: Number, required: true },
    reason: { type: String },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ScholarshipDiscountSchema.plugin(softDeletePlugin);

export default (mongoose.models['ScholarshipDiscount'] || (mongoose.models['ScholarshipDiscount'] || mongoose.model<IScholarshipDiscount>('ScholarshipDiscount', ScholarshipDiscountSchema)) as any) as any;
