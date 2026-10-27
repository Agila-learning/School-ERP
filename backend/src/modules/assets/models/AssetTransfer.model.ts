import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssetTransfer extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
  
  fromLocationId?: mongoose.Types.ObjectId;
  toLocationId?: mongoose.Types.ObjectId;
  
  fromEmployeeId?: mongoose.Types.ObjectId;
  toEmployeeId?: mongoose.Types.ObjectId;
  
  fromDepartmentId?: mongoose.Types.ObjectId;
  toDepartmentId?: mongoose.Types.ObjectId;
  
  transferDate: Date;
  status: 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  
  reason?: string;
}

const AssetTransferSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  
  fromLocationId: { type: Schema.Types.ObjectId, ref: 'AssetLocation' },
  toLocationId: { type: Schema.Types.ObjectId, ref: 'AssetLocation' },
  
  fromEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  toEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  
  fromDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  toDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  
  transferDate: { type: Date, required: true, default: Date.now },
  
  status: {
    type: String,
    enum: ['REQUESTED', 'APPROVED', 'COMPLETED', 'REJECTED'],
    default: 'REQUESTED'
  },
  
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  reason: String,
}, { timestamps: true });

AssetTransferSchema.plugin(softDeletePlugin);

export default (mongoose.models['AssetTransfer'] || mongoose.model<IAssetTransfer>('AssetTransfer', AssetTransferSchema)) as any;
