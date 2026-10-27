import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IClass extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  level: number;
  description?: string;
  displayOrder: number;
  capacity?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const ClassSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    level: { type: Number, required: true, default: 0 },
    description: String,
    displayOrder: { type: Number, default: 0 },
    capacity: { type: Number, default: 30 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

ClassSchema.index({ tenantId: 1, branchId: 1, name: 1 }, { unique: true });
ClassSchema.index({ tenantId: 1, branchId: 1, code: 1 }, { unique: true });
ClassSchema.plugin(softDeletePlugin);

export default (mongoose.models['Class'] || (mongoose.models['Class'] || mongoose.model<IClass>('Class', ClassSchema)) as any) as any;
