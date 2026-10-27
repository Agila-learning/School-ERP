import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelBuilding extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  numberOfFloors: number;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
}

export interface IHostelFloor extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  buildingId: mongoose.Types.ObjectId;
  floorNumber: number;
  floorName: string; // e.g., "Ground Floor", "First Floor"
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
}

const BuildingSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  numberOfFloors: { type: Number, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'], default: 'ACTIVE' },
}, { timestamps: true });

BuildingSchema.index({ tenantId: 1, hostelId: 1, code: 1 }, { unique: true });
BuildingSchema.plugin(softDeletePlugin);

const FloorSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  buildingId: { type: Schema.Types.ObjectId, ref: 'HostelBuilding', required: true, index: true },
  floorNumber: { type: Number, required: true },
  floorName: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'], default: 'ACTIVE' },
}, { timestamps: true });

FloorSchema.index({ tenantId: 1, buildingId: 1, floorNumber: 1 }, { unique: true });
FloorSchema.plugin(softDeletePlugin);

export const HostelBuilding = (mongoose.models['HostelBuilding'] || mongoose.model<IHostelBuilding>('HostelBuilding', BuildingSchema)) as any;
export const HostelFloor = (mongoose.models['HostelFloor'] || mongoose.model<IHostelFloor>('HostelFloor', FloorSchema)) as any;
