import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IRoute extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  startPoint: string;
  endPoint: string;
  estimatedDurationMinutes: number;
  distanceKm?: number;
  defaultVehicleId?: mongoose.Types.ObjectId; // Ref: Vehicle
  defaultDriverId?: mongoose.Types.ObjectId;  // Ref: Employee (Driver)
  defaultAttendantId?: mongoose.Types.ObjectId; // Ref: Employee (Attendant)
  status: 'ACTIVE' | 'INACTIVE';
}

const RouteSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', default: () => new mongoose.Types.ObjectId() },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', default: () => new mongoose.Types.ObjectId() },
    name: { type: String, required: true },
    code: { type: String, required: true },
    startPoint: { type: String, required: true },
    endPoint: { type: String, required: true },
    estimatedDurationMinutes: { type: Number, default: 45 },
    distanceKm: { type: Number, default: 10 },
    defaultVehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    defaultDriverId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    defaultAttendantId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

RouteSchema.index({ tenantId: 1, code: 1 });
RouteSchema.plugin(softDeletePlugin);

export default (mongoose.models['Route'] || (mongoose.models['Route'] || mongoose.model<IRoute>('Route', RouteSchema)) as any) as any;
