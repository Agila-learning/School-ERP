import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IDepartment extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  name: string; // e.g., 'Science', 'IT', 'Administration'
  code: string;
  description?: string;
  headOfDepartmentId?: mongoose.Types.ObjectId; // Ref Employee
  parentId?: mongoose.Types.ObjectId; // For hierarchy
  status: 'ACTIVE' | 'INACTIVE';
}

const DepartmentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: String,
  headOfDepartmentId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  parentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

DepartmentSchema.index({ tenantId: 1, code: 1 }, { unique: true });
DepartmentSchema.plugin(softDeletePlugin);

export default (mongoose.models['Department'] || (mongoose.models['Department'] || mongoose.model<IDepartment>('Department', DepartmentSchema)) as any) as any;
