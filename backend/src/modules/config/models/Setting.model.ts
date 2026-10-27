import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISetting extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  group: string; // e.g., 'GENERAL', 'ACADEMIC', 'ATTENDANCE', 'FINANCE', 'SECURITY', 'BRANDING'
  key: string;
  value: any; // Can be string, number, boolean, or object
  description?: string;
  isSystem: boolean;
}

const SettingSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    group: { type: String, required: true, index: true },
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: String,
    isSystem: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

SettingSchema.index({ tenantId: 1, key: 1 }, { unique: true });
SettingSchema.plugin(softDeletePlugin);

export default (mongoose.models['Setting'] || (mongoose.models['Setting'] || mongoose.model<ISetting>('Setting', SettingSchema)) as any) as any;
