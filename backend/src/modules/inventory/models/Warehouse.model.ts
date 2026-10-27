import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IWarehouse extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId; // E.g., which campus
  warehouseIdString: string;
  name: string;
  address?: string;
  managerId?: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}

const WarehouseSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  warehouseIdString: { type: String, required: true },
  name: { type: String, required: true },
  address: String,
  managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

WarehouseSchema.plugin(softDeletePlugin);

export default (mongoose.models['Warehouse'] || (mongoose.models['Warehouse'] || mongoose.model<IWarehouse>('Warehouse', WarehouseSchema)) as any) as any;
