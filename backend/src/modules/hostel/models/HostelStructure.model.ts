import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelBlock extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  buildingId: mongoose.Types.ObjectId;
  name: string;
  capacity: number;
  wardenId?: mongoose.Types.ObjectId;
  floorCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

export interface IHostelFloor extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  blockId: mongoose.Types.ObjectId;
  floorNumber: string;
  roomCount: number;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

const BlockSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
  buildingId: { type: Schema.Types.ObjectId, ref: 'HostelBuilding', required: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  wardenId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  floorCount: { type: Number, required: true, default: 1 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], default: 'ACTIVE' },
}, { timestamps: true });

BlockSchema.index({ tenantId: 1, buildingId: 1, name: 1 }, { unique: true });
BlockSchema.plugin(softDeletePlugin);

const FloorSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  blockId: { type: Schema.Types.ObjectId, ref: 'HostelBlock', required: true },
  floorNumber: { type: String, required: true },
  roomCount: { type: Number, required: true, default: 0 },
  capacity: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], default: 'ACTIVE' },
}, { timestamps: true });

FloorSchema.index({ tenantId: 1, blockId: 1, floorNumber: 1 }, { unique: true });
FloorSchema.plugin(softDeletePlugin);

export const HostelBlock = (mongoose.models['HostelBlock'] || mongoose.model<IHostelBlock>('HostelBlock', BlockSchema)) as any;
export const HostelFloor = (mongoose.models['HostelFloor'] || mongoose.model<IHostelFloor>('HostelFloor', FloorSchema)) as any;
