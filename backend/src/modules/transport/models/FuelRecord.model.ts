import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IFuelRecord extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  date: Date;
  fuelType: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC';
  quantity: number; // Liters or units
  cost: number;
  odometerReading: number;
  fuelStation: string;
  driverId?: mongoose.Types.ObjectId; // Ref: Employee
  receiptUrl?: string;
  expenseId?: mongoose.Types.ObjectId; // Loose ref to Finance module
  anomalyFlag?: boolean;
}

const FuelRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    date: { type: Date, required: true },
    fuelType: { type: String, enum: ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'], required: true },
    quantity: { type: Number, required: true },
    cost: { type: Number, required: true },
    odometerReading: { type: Number, required: true },
    fuelStation: String,
    driverId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    receiptUrl: String,
    expenseId: mongoose.Types.ObjectId,
    anomalyFlag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FuelRecordSchema.plugin(softDeletePlugin);

export default (mongoose.models['FuelRecord'] || (mongoose.models['FuelRecord'] || mongoose.model<IFuelRecord>('FuelRecord', FuelRecordSchema)) as any) as any;
