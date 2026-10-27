import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IDesignation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g., 'Principal', 'Senior Teacher'
  code: string;
  departmentId?: mongoose.Types.ObjectId; // If scoped to department
  grade?: string; // e.g., 'L1', 'L2'
  level?: number; // 1 for highest (Principal)
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const DesignationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  grade: String,
  level: Number,
  description: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

DesignationSchema.index({ tenantId: 1, code: 1 }, { unique: true });
DesignationSchema.plugin(softDeletePlugin);

export default (mongoose.models['Designation'] || (mongoose.models['Designation'] || mongoose.model<IDesignation>('Designation', DesignationSchema)) as any) as any;
