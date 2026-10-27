import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITransportSettings extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  transportManagerId?: mongoose.Types.ObjectId; // Ref: Employee
  contactNumber: string;
  emergencyNumber: string;
  workingDays: string[];
  operatingHours: {
    start: string;
    end: string;
  };
  gpsEnabled: boolean;
  parentTrackingEnabled: boolean;
  transportFeeEnabled: boolean;
  lateArrivalThresholdMinutes: number;
  pickupRules: string;
  dropoffRules: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const TransportSettingsSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    campusId: { type: Schema.Types.ObjectId, ref: 'Campus' },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    transportManagerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    contactNumber: { type: String, required: true },
    emergencyNumber: { type: String, required: true },
    workingDays: [{ type: String, enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] }],
    operatingHours: {
      start: String,
      end: String,
    },
    gpsEnabled: { type: Boolean, default: true },
    parentTrackingEnabled: { type: Boolean, default: true },
    transportFeeEnabled: { type: Boolean, default: true },
    lateArrivalThresholdMinutes: { type: Number, default: 15 },
    pickupRules: String,
    dropoffRules: String,
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

TransportSettingsSchema.index({ tenantId: 1, branchId: 1, academicYearId: 1 }, { unique: true });
TransportSettingsSchema.plugin(softDeletePlugin);

export default (mongoose.models['TransportSettings'] || (mongoose.models['TransportSettings'] || mongoose.model<ITransportSettings>('TransportSettings', TransportSettingsSchema)) as any) as any;
