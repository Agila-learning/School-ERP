import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITransportStaff extends Document, ISoftDeleted {
  id: string;
  tenantId: any;
  employeeId?: any;
  name: string;
  phone: string;
  emergencyContact?: string;
  roleType: 'DRIVER' | 'ATTENDANT';
  licenseNumber?: string;
  licenseClass?: string;
  licenseIssueDate?: Date;
  licenseExpiryDate?: Date;
  yearsOfExperience?: number;
  assignedVehicleId?: any;
  assignedRouteId?: any;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  medicalClearanceDate?: Date;
  policeVerificationDate?: Date;
  dutyStatus: 'AVAILABLE' | 'ON_DUTY' | 'ON_TRIP' | 'OFF_DUTY' | 'STANDBY';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

const TransportStaffSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    employeeId: { type: Schema.Types.Mixed, ref: 'Employee', required: false, index: true },
    name: { type: String },
    phone: { type: String },
    emergencyContact: { type: String },
    roleType: { type: String, enum: ['DRIVER', 'ATTENDANT'], default: 'DRIVER' },
    licenseNumber: String,
    licenseClass: String,
    licenseIssueDate: Date,
    licenseExpiryDate: Date,
    yearsOfExperience: { type: Number, default: 4 },
    assignedVehicleId: { type: Schema.Types.Mixed, ref: 'Vehicle' },
    assignedRouteId: { type: Schema.Types.Mixed, ref: 'Route' },
    verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'VERIFIED' },
    medicalClearanceDate: Date,
    policeVerificationDate: Date,
    dutyStatus: { type: String, enum: ['AVAILABLE', 'ON_DUTY', 'ON_TRIP', 'OFF_DUTY', 'STANDBY'], default: 'AVAILABLE' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

TransportStaffSchema.plugin(softDeletePlugin);

export default (mongoose.models['TransportStaff'] || (mongoose.models['TransportStaff'] || mongoose.model<ITransportStaff>('TransportStaff', TransportStaffSchema)) as any) as any;
