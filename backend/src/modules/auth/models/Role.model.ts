import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IRole extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean; // System roles cannot be deleted or modified
}

const RoleSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    permissions: [{
      type: String,
      required: true,
    }],
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

RoleSchema.index({ tenantId: 1, name: 1 }, { unique: true });
RoleSchema.plugin(softDeletePlugin);

export default (mongoose.models['Role'] || (mongoose.models['Role'] || mongoose.model<IRole>('Role', RoleSchema)) as any) as any;
