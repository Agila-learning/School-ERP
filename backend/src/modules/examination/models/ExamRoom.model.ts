import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IExamRoom extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  building?: string;
  floor?: string;
  capacity: number;
  layout?: 'GRID' | 'CIRCULAR' | 'CUSTOM';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

const ExamRoomSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  building: String,
  floor: String,
  capacity: { type: Number, required: true },
  layout: { type: String, enum: ['GRID', 'CIRCULAR', 'CUSTOM'], default: 'GRID' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], default: 'ACTIVE' },
}, { timestamps: true });

ExamRoomSchema.index({ tenantId: 1, branchId: 1, code: 1 }, { unique: true });
ExamRoomSchema.plugin(softDeletePlugin);

export default (mongoose.models['ExamRoom'] || (mongoose.models['ExamRoom'] || mongoose.model<IExamRoom>('ExamRoom', ExamRoomSchema)) as any) as any;
