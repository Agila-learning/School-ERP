import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IFeeDemand extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  feeStructureId: mongoose.Types.ObjectId;
  feeHeadId: mongoose.Types.ObjectId;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  isInvoiced: boolean;
  invoiceId?: mongoose.Types.ObjectId;
}

const FeeDemandSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    feeStructureId: { type: Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
    feeHeadId: { type: Schema.Types.ObjectId, ref: 'FeeHead', required: true },
    installmentNumber: { type: Number, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    isInvoiced: { type: Boolean, default: false },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  },
  { timestamps: true }
);

FeeDemandSchema.index({ tenantId: 1, studentId: 1, feeStructureId: 1, installmentNumber: 1 }, { unique: true });
FeeDemandSchema.plugin(softDeletePlugin);

export default (mongoose.models['FeeDemand'] || (mongoose.models['FeeDemand'] || mongoose.model<IFeeDemand>('FeeDemand', FeeDemandSchema)) as any) as any;
