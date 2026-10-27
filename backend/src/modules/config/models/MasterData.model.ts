import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IMasterData extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  type: string; // e.g. 'BloodGroup', 'Religion', 'SchoolType', 'Board'
  code: string;
  name: string;
  description?: string;
  metadata?: Record<string, any>; // Flexible for specific rules (e.g. { maxCapacity: 50 })
  isActive: boolean;
  isSystem: boolean; // True if it cannot be deleted by the user
}

const MasterDataSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, required: true, index: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    metadata: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

MasterDataSchema.index({ tenantId: 1, type: 1, code: 1 }, { unique: true });
MasterDataSchema.plugin(softDeletePlugin);

export default (mongoose.models['MasterData'] || (mongoose.models['MasterData'] || mongoose.model<IMasterData>('MasterData', MasterDataSchema)) as any) as any;
