import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssetLocation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  branchId: mongoose.Types.ObjectId;
  building?: string;
  floor?: string;
  room?: string;
  departmentId?: mongoose.Types.ObjectId;
}

const AssetLocationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  building: String,
  floor: String,
  room: String,
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
}, { timestamps: true });

AssetLocationSchema.plugin(softDeletePlugin);
AssetLocationSchema.index({ tenantId: 1, name: 1, branchId: 1 }, { unique: true });

export default (mongoose.models['AssetLocation'] || mongoose.model<IAssetLocation>('AssetLocation', AssetLocationSchema)) as any;
