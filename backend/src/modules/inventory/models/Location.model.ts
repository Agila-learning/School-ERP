import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILocation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  parentLocationId?: mongoose.Types.ObjectId; // Hierarchical locations (Room -> Rack -> Shelf -> Bin)
  name: string; // e.g., "Rack A", "Shelf 3"
  type: 'ROOM' | 'RACK' | 'SHELF' | 'BIN' | 'OTHER';
}

const LocationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
  parentLocationId: { type: Schema.Types.ObjectId, ref: 'Location' },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['ROOM', 'RACK', 'SHELF', 'BIN', 'OTHER'],
    default: 'OTHER'
  },
}, { timestamps: true });

LocationSchema.plugin(softDeletePlugin);

export default (mongoose.models['Location'] || (mongoose.models['Location'] || mongoose.model<ILocation>('Location', LocationSchema)) as any) as any;
