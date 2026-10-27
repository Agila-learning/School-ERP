import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IDepartment extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  headId?: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}

const DepartmentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: String,
    headId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

DepartmentSchema.index({ tenantId: 1, code: 1 }, { unique: true });
DepartmentSchema.plugin(softDeletePlugin);

export default (mongoose.models['Department'] || (mongoose.models['Department'] || mongoose.model<IDepartment>('Department', DepartmentSchema)) as any) as any;
