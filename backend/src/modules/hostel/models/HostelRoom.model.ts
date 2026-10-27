import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelRoom extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  buildingId: mongoose.Types.ObjectId;
  blockId: mongoose.Types.ObjectId;
  floorId: mongoose.Types.ObjectId;
  roomNumber: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_BED' | 'DORMITORY' | 'CUSTOM';
  capacity: number;
  currentOccupancy: number;
  genderApplicability: 'MALE' | 'FEMALE' | 'MIXED';
  facilities: string[]; // Configurable: ['FAN', 'AC', 'ATTACHED_BATHROOM', 'WIFI', ...]
  status: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE' | 'BLOCKED';
}

export interface IHostelBed extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  bedNumber: string; // e.g., "A", "B", "1", "2"
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE' | 'BLOCKED';
  currentAllocationId?: mongoose.Types.ObjectId;
}

const RoomSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
  buildingId: { type: Schema.Types.ObjectId, ref: 'HostelBuilding' },
  blockId: { type: Schema.Types.ObjectId, ref: 'HostelBlock' },
  floorId: { type: Schema.Types.ObjectId, ref: 'HostelFloor', index: true },
  roomNumber: { type: String, required: true },
  roomType: { type: String, enum: ['SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_BED', 'DORMITORY', 'CUSTOM'], default: 'DOUBLE' },
  capacity: { type: Number, required: true, default: 2 },
  currentOccupancy: { type: Number, default: 0 },
  genderApplicability: { type: String, enum: ['MALE', 'FEMALE', 'MIXED'], default: 'MIXED' },
  facilities: [String],
  status: { type: String, enum: ['AVAILABLE', 'PARTIALLY_OCCUPIED', 'FULL', 'MAINTENANCE', 'BLOCKED'], default: 'AVAILABLE' },
}, { timestamps: true });

RoomSchema.index({ tenantId: 1, hostelId: 1, roomNumber: 1 }, { unique: true });
RoomSchema.plugin(softDeletePlugin);

const BedSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'HostelRoom', required: true, index: true },
  bedNumber: { type: String, required: true },
  status: { type: String, enum: ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE', 'BLOCKED'], default: 'AVAILABLE' },
  currentAllocationId: { type: Schema.Types.ObjectId, ref: 'HostelAllocation' },
}, { timestamps: true });

BedSchema.index({ tenantId: 1, roomId: 1, bedNumber: 1 }, { unique: true });
BedSchema.plugin(softDeletePlugin);

export const HostelRoom = (mongoose.models['HostelRoom'] || mongoose.model<IHostelRoom>('HostelRoom', RoomSchema)) as any;
export const HostelBed = (mongoose.models['HostelBed'] || mongoose.model<IHostelBed>('HostelBed', BedSchema)) as any;
