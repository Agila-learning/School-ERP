import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IGate extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  location: string;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  allowedAccessTypes: string[];
  assignedGuards: mongoose.Types.ObjectId[];
  emergencyStatus: 'NORMAL' | 'ALERT' | 'LOCKDOWN' | 'CLOSED';
  isActive: boolean;
}

export interface IGateEntry extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  entryNumber: string;
  personId?: mongoose.Types.ObjectId;
  personType: 'STUDENT' | 'EMPLOYEE' | 'VISITOR' | 'VENDOR' | 'CONTRACTOR' | 'DELIVERY' | 'OTHER';
  personName: string;
  gateId: mongoose.Types.ObjectId;
  entryTime: Date;
  passId?: mongoose.Types.ObjectId;
  vehicleNumber?: string;
  method: 'MANUAL' | 'QR_SCAN' | 'RFID' | 'BIOMETRIC' | 'OTHER';
  recordedBy: mongoose.Types.ObjectId;
  notes?: string;
  status: 'ENTERED' | 'DENIED';
  denialReason?: string;
}

export interface IGateExit extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  entryId: mongoose.Types.ObjectId;
  personId?: mongoose.Types.ObjectId;
  personType: string;
  personName: string;
  gateId: mongoose.Types.ObjectId;
  exitTime: Date;
  passId?: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  notes?: string;
}

export interface IGatePass extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  passId: string;
  personId: mongoose.Types.ObjectId;
  personType: 'STUDENT' | 'EMPLOYEE' | 'VISITOR' | 'VENDOR' | 'CONTRACTOR' | 'VEHICLE';
  passType: 'STUDENT_GATE_PASS' | 'EMPLOYEE_GATE_PASS' | 'VISITOR_PASS' | 'VENDOR_PASS' | 'CONTRACTOR_PASS' | 'VEHICLE_PASS' | 'TEMPORARY_PASS';
  purpose: string;
  validFrom: Date;
  validUntil: Date;
  approvedBy: mongoose.Types.ObjectId;
  gateId?: mongoose.Types.ObjectId;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'USED';
  revokedBy?: mongoose.Types.ObjectId;
  revocationReason?: string;
  revokedAt?: Date;
  qrReference: string;
}

const GateSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  operatingHoursStart: { type: String, default: '06:00' },
  operatingHoursEnd: { type: String, default: '22:00' },
  allowedAccessTypes: [{ type: String }],
  assignedGuards: [{ type: Schema.Types.Mixed, ref: 'Employee' }],
  emergencyStatus: { type: String, enum: ['NORMAL','ALERT','LOCKDOWN','CLOSED'], default: 'NORMAL' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const GateEntrySchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  entryNumber: { type: String, required: true, unique: true },
  personId: { type: Schema.Types.Mixed },
  personType: { type: String, required: true, index: true },
  personName: { type: String, required: true },
  gateId: { type: Schema.Types.Mixed, ref: 'Gate', required: false, index: true },
  entryTime: { type: Date, required: true, default: Date.now, index: true },
  passId: { type: Schema.Types.Mixed, ref: 'GatePass' },
  vehicleNumber: String,
  method: { type: String, default: 'MANUAL', required: false },
  recordedBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  notes: String,
  status: { type: String, enum: ['ENTERED','DENIED'], default: 'ENTERED' },
  denialReason: String,
}, { timestamps: true });

const GateExitSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  entryId: { type: Schema.Types.Mixed, ref: 'GateEntry', required: false, index: true },
  personId: { type: Schema.Types.Mixed },
  personType: { type: String, default: 'VISITOR' },
  personName: { type: String, default: 'Visitor', required: false },
  gateId: { type: Schema.Types.Mixed, ref: 'Gate', required: false, index: true },
  exitTime: { type: Date, required: true, default: Date.now, index: true },
  passId: { type: Schema.Types.Mixed, ref: 'GatePass' },
  recordedBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  notes: String,
}, { timestamps: true });

const GatePassSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  passId: { type: String, required: true, unique: true },
  personId: { type: Schema.Types.Mixed, required: false, index: true },
  personType: { type: String, required: true },
  passType: { type: String, required: true },
  purpose: { type: String, required: true },
  validFrom: { type: Date, required: true, default: Date.now },
  validUntil: { type: Date, required: true, index: true },
  approvedBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  gateId: { type: Schema.Types.Mixed, ref: 'Gate' },
  status: { type: String, enum: ['PENDING','ACTIVE','EXPIRED','REVOKED','USED'], default: 'ACTIVE', index: true },
  revokedBy: { type: Schema.Types.Mixed, ref: 'User' },
  revocationReason: String,
  revokedAt: Date,
  qrReference: { type: String, required: true, unique: true },
}, { timestamps: true });

[GateSchema, GateEntrySchema, GateExitSchema, GatePassSchema].forEach(s => s.plugin(softDeletePlugin));

export const Gate = (mongoose.models['Gate'] || mongoose.model<IGate>('Gate', GateSchema)) as any;
export const GateEntry = (mongoose.models['GateEntry'] || mongoose.model<IGateEntry>('GateEntry', GateEntrySchema)) as any;
export const GateExit = (mongoose.models['GateExit'] || mongoose.model<IGateExit>('GateExit', GateExitSchema)) as any;
export const GatePass = (mongoose.models['GatePass'] || mongoose.model<IGatePass>('GatePass', GatePassSchema)) as any;
