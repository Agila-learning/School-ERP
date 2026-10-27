import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type MaintenanceType = 
  | 'GENERAL_SERVICE' | 'OIL_CHANGE' | 'TYRE_REPLACEMENT' | 'BRAKE_SERVICE'
  | 'BATTERY' | 'AC_SERVICE' | 'ENGINE' | 'ELECTRICAL' | 'EMERGENCY_REPAIR' | 'OTHER';

export interface IVehicleMaintenance extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  maintenanceType: MaintenanceType;
  serviceDate: Date;
  odometerReading: number;
  cost: number;
  vendorName?: string;
  description?: string;
  nextServiceDate?: Date;
  nextServiceMileage?: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  invoiceUrl?: string;
  expenseId?: mongoose.Types.ObjectId; // Link to Finance Expense once integrated
}

const VehicleMaintenanceSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    maintenanceType: {
      type: String,
      enum: ['GENERAL_SERVICE', 'OIL_CHANGE', 'TYRE_REPLACEMENT', 'BRAKE_SERVICE', 'BATTERY', 'AC_SERVICE', 'ENGINE', 'ELECTRICAL', 'EMERGENCY_REPAIR', 'OTHER'],
      required: true,
    },
    serviceDate: { type: Date, required: true },
    odometerReading: { type: Number, required: true },
    cost: { type: Number, default: 0 },
    vendorName: String,
    description: String,
    nextServiceDate: Date,
    nextServiceMileage: Number,
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'COMPLETED',
    },
    invoiceUrl: String,
    expenseId: mongoose.Types.ObjectId, // Loose ref to Finance module
  },
  { timestamps: true }
);

VehicleMaintenanceSchema.plugin(softDeletePlugin);

export default (mongoose.models['VehicleMaintenance'] || (mongoose.models['VehicleMaintenance'] || mongoose.model<IVehicleMaintenance>('VehicleMaintenance', VehicleMaintenanceSchema)) as any) as any;
