import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAcademicYearRollover extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  fromAcademicYearId: mongoose.Types.ObjectId;
  toAcademicYearId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'VALIDATING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  validationErrors: any[];
  totalStudentsProcessed: number;
  promotedCount: number;
  detainedCount: number;
  graduatedCount: number;
  failedCount: number;
  startedAt?: Date;
  completedAt?: Date;
  initiatedByUserId: mongoose.Types.ObjectId;
}

const AcademicYearRolloverSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    fromAcademicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    toAcademicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    status: { 
      type: String, 
      enum: ['PENDING', 'VALIDATING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ROLLED_BACK'], 
      default: 'PENDING' 
    },
    validationErrors: { type: Schema.Types.Mixed, default: [] },
    totalStudentsProcessed: { type: Number, default: 0 },
    promotedCount: { type: Number, default: 0 },
    detainedCount: { type: Number, default: 0 },
    graduatedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    startedAt: Date,
    completedAt: Date,
    initiatedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

AcademicYearRolloverSchema.plugin(softDeletePlugin);

export default (mongoose.models['AcademicYearRollover'] || mongoose.model<IAcademicYearRollover>('AcademicYearRollover', AcademicYearRolloverSchema)) as any;
