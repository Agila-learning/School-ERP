import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IVehicle extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  vehicleNumber: string; // e.g., Bus 1, Van A
  registrationNumber: string; // e.g., TN-24-XX-1234
  vehicleType: 'BUS' | 'MINI_BUS' | 'VAN' | 'CAR';
  manufacturer: string;
  modelName: string;
  manufacturingYear: number;
  seatingCapacity: number;
  standingCapacity: number;
  totalCapacity: number;
  fuelType: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC';
  gpsDeviceId?: string; // Identifier for the GPS hardware provider
  emergencyEquipmentStatus: 'PASS' | 'FAIL' | 'NOT_CHECKED';
  firstAidAvailable: boolean;
  insuranceExpiry?: Date;
  fitnessExpiry?: Date;
  permitExpiry?: Date;
  status: 'AVAILABLE' | 'ASSIGNED' | 'ON_TRIP' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';
}

const VehicleSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    campusId: { type: Schema.Types.ObjectId, ref: 'Campus' },
    vehicleNumber: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    vehicleType: { type: String, enum: ['BUS', 'MINI_BUS', 'VAN', 'CAR'], required: true },
    manufacturer: { type: String, required: true },
    modelName: { type: String, required: true },
    manufacturingYear: { type: Number, required: true },
    seatingCapacity: { type: Number, required: true },
    standingCapacity: { type: Number, default: 0 },
    totalCapacity: { type: Number, required: true },
    fuelType: { type: String, enum: ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'], required: true },
    gpsDeviceId: String,
    emergencyEquipmentStatus: { type: String, enum: ['PASS', 'FAIL', 'NOT_CHECKED'], default: 'NOT_CHECKED' },
    firstAidAvailable: { type: Boolean, default: true },
    insuranceExpiry: Date,
    fitnessExpiry: Date,
    permitExpiry: Date,
    status: { 
      type: String, 
      enum: ['AVAILABLE', 'ASSIGNED', 'ON_TRIP', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED'],
      default: 'AVAILABLE'
    },
  },
  { timestamps: true }
);

VehicleSchema.index({ tenantId: 1, registrationNumber: 1 }, { unique: true });
VehicleSchema.plugin(softDeletePlugin);

export default (mongoose.models['Vehicle'] || (mongoose.models['Vehicle'] || mongoose.model<IVehicle>('Vehicle', VehicleSchema)) as any) as any;
