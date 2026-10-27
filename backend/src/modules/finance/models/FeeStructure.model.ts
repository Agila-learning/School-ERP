import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IFeeInstallment {
  installmentNumber: number;
  amount: number;
  dueDate: Date;
}

export interface IFeeStructure extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId; // Optional: Some fees apply universally
  feeHeadId: mongoose.Types.ObjectId;
  totalAmount: number;
  frequency: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL' | 'CUSTOM';
  installments: IFeeInstallment[];
  effectiveDate: Date;
  lateFeePolicy?: {
    type: 'FIXED' | 'PERCENTAGE' | 'DAILY';
    value: number;
    gracePeriodDays: number;
    maxLateFee?: number;
  };
  isActive: boolean;
}

const FeeStructureSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    feeHeadId: { type: Schema.Types.ObjectId, ref: 'FeeHead', required: true },
    totalAmount: { type: Number, required: true },
    frequency: {
      type: String,
      enum: ['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL', 'CUSTOM'],
      required: true,
    },
    installments: [
      {
        installmentNumber: { type: Number, required: true },
        amount: { type: Number, required: true },
        dueDate: { type: Date, required: true },
      },
    ],
    effectiveDate: { type: Date, required: true },
    lateFeePolicy: {
      type: { type: String, enum: ['FIXED', 'PERCENTAGE', 'DAILY'] },
      value: Number,
      gracePeriodDays: Number,
      maxLateFee: Number,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FeeStructureSchema.index({ tenantId: 1, academicYearId: 1, branchId: 1, classId: 1, feeHeadId: 1 });
FeeStructureSchema.plugin(softDeletePlugin);

export default (mongoose.models['FeeStructure'] || (mongoose.models['FeeStructure'] || mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema)) as any) as any;
