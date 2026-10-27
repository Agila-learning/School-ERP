import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITransferRecord extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  previousSectionId: mongoose.Types.ObjectId;
  newSectionId: mongoose.Types.ObjectId;
  previousBranchId?: mongoose.Types.ObjectId;
  newBranchId?: mongoose.Types.ObjectId;
  transferDate: Date;
  reason?: string;
  transferredByUserId: mongoose.Types.ObjectId;
}

const TransferRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    previousSectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    newSectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    previousBranchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    newBranchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    transferDate: { type: Date, default: Date.now },
    reason: String,
    transferredByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

TransferRecordSchema.plugin(softDeletePlugin);

export default (mongoose.models['TransferRecord'] || (mongoose.models['TransferRecord'] || mongoose.model<ITransferRecord>('TransferRecord', TransferRecordSchema)) as any) as any;
