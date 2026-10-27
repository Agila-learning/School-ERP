import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type VehicleType = 'SCHOOL_BUS' | 'PARENT_VEHICLE' | 'STAFF_VEHICLE' | 'VENDOR_VEHICLE' | 'DELIVERY_VEHICLE' | 'CONTRACTOR_VEHICLE' | 'EMERGENCY_VEHICLE' | 'OTHER';

export interface IVehicle extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  registrationNumber: string;
  vehicleType: VehicleType;
  make?: string;
  color?: string;
  ownerName?: string;
  ownerType: 'EMPLOYEE' | 'PARENT' | 'VENDOR' | 'CONTRACTOR' | 'SCHOOL' | 'OTHER';
  ownerId?: mongoose.Types.ObjectId;
  driverName?: string;
  organization?: string;
  purpose?: string;
  permitNumber?: string;
  isPermitted: boolean;
  status: 'ACTIVE' | 'BLACKLISTED' | 'EXPIRED_PERMIT';
}

export interface IVehicleEntry extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  registrationNumber: string;
  driverName?: string;
  accompanyingPersonId?: mongoose.Types.ObjectId;
  accompanyingPersonName?: string;
  gateId: mongoose.Types.ObjectId;
  entryTime: Date;
  exitTime?: Date;
  parkingAreaId?: mongoose.Types.ObjectId;
  purpose: string;
  passId?: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  status: 'INSIDE' | 'EXITED';
}

export interface IParkingArea extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  location: string;
  totalCapacity: number;
  reservedForTypes: string[];
  isActive: boolean;
}

export interface IParkingAllocation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  parkingAreaId: mongoose.Types.ObjectId;
  vehicleEntryId: mongoose.Types.ObjectId;
  vehicleRegistration: string;
  allocatedAt: Date;
  releasedAt?: Date;
  status: 'OCCUPIED' | 'RELEASED';
}

const VehicleSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  registrationNumber: { type: String, required: true, index: true },
  vehicleType: { type: String, enum: ['SCHOOL_BUS','PARENT_VEHICLE','STAFF_VEHICLE','VENDOR_VEHICLE','DELIVERY_VEHICLE','CONTRACTOR_VEHICLE','EMERGENCY_VEHICLE','OTHER'], default: 'PARENT_VEHICLE' },
  make: String,
  color: String,
  ownerName: String,
  ownerType: { type: String, default: 'VISITOR' },
  ownerId: Schema.Types.Mixed,
  driverName: String,
  organization: String,
  purpose: String,
  permitNumber: String,
  isPermitted: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE','BLACKLISTED','EXPIRED_PERMIT'], default: 'ACTIVE' },
}, { timestamps: true });

const VehicleEntrySchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  vehicleId: { type: Schema.Types.Mixed, ref: 'SecurityVehicle' },
  registrationNumber: { type: String, required: true, index: true },
  driverName: String,
  accompanyingPersonId: Schema.Types.Mixed,
  accompanyingPersonName: String,
  gateId: { type: Schema.Types.Mixed, ref: 'Gate', required: false },
  entryTime: { type: Date, required: true, default: Date.now, index: true },
  exitTime: Date,
  parkingAreaId: { type: Schema.Types.Mixed, ref: 'ParkingArea' },
  purpose: { type: String, required: false },
  passId: { type: Schema.Types.Mixed, ref: 'GatePass' },
  recordedBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  status: { type: String, enum: ['INSIDE','EXITED'], default: 'INSIDE', index: true },
}, { timestamps: true });

const ParkingAreaSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  totalCapacity: { type: Number, default: 50 },
  reservedForTypes: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ParkingAllocationSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  parkingAreaId: { type: Schema.Types.Mixed, ref: 'ParkingArea', required: false },
  vehicleEntryId: { type: Schema.Types.Mixed, ref: 'VehicleEntry', required: false },
  vehicleRegistration: { type: String, required: true },
  allocatedAt: { type: Date, required: true, default: Date.now },
  releasedAt: Date,
  status: { type: String, enum: ['OCCUPIED','RELEASED'], default: 'OCCUPIED' },
}, { timestamps: true });

VehicleSchema.plugin(softDeletePlugin);
VehicleEntrySchema.plugin(softDeletePlugin);
ParkingAreaSchema.plugin(softDeletePlugin);
ParkingAllocationSchema.plugin(softDeletePlugin);

export const Vehicle = (mongoose.models['SecurityVehicle'] || mongoose.model<IVehicle>('SecurityVehicle', VehicleSchema)) as any;
export const VehicleEntry = (mongoose.models['SecurityVehicleEntry'] || mongoose.model<IVehicleEntry>('SecurityVehicleEntry', VehicleEntrySchema)) as any;
export const ParkingArea = (mongoose.models['SecurityParkingArea'] || mongoose.model<IParkingArea>('SecurityParkingArea', ParkingAreaSchema)) as any;
export const ParkingAllocation = (mongoose.models['SecurityParkingAllocation'] || mongoose.model<IParkingAllocation>('SecurityParkingAllocation', ParkingAllocationSchema)) as any;
