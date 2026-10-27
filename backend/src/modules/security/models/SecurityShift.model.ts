import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISecurityShift extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  shiftDate: Date;
  shiftName: string;
  startTime: string;
  endTime: string;
  gateId?: mongoose.Types.ObjectId;
  guardId: mongoose.Types.ObjectId;
  supervisorId?: mongoose.Types.ObjectId;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ABSENT' | 'CANCELLED';
  checkInTime?: Date;
  checkOutTime?: Date;
}

export interface IShiftHandover extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  outgoingShiftId: mongoose.Types.ObjectId;
  incomingShiftId: mongoose.Types.ObjectId;
  outgoingGuardId: mongoose.Types.ObjectId;
  incomingGuardId: mongoose.Types.ObjectId;
  handoverTime: Date;
  visitorsCurrentlyInside: number;
  vehiclesCurrentlyInside: number;
  openIncidents: number;
  pendingDeliveries: number;
  specialInstructions?: string;
  openIssues?: string;
  handoverNotes?: string;
  acknowledgedByIncoming: boolean;
  acknowledgedAt?: Date;
}

const SecurityShiftSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  shiftDate: { type: Date, required: true, default: Date.now, index: true },
  shiftName: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  gateId: { type: Schema.Types.Mixed, ref: 'Gate' },
  guardId: { type: Schema.Types.Mixed, ref: 'Employee', required: false, index: true },
  supervisorId: { type: Schema.Types.Mixed, ref: 'Employee' },
  status: { type: String, enum: ['SCHEDULED','ACTIVE','COMPLETED','ABSENT','CANCELLED'], default: 'SCHEDULED', index: true },
  checkInTime: Date,
  checkOutTime: Date,
}, { timestamps: true });

const ShiftHandoverSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  outgoingShiftId: { type: Schema.Types.Mixed, ref: 'SecurityShift', required: false },
  incomingShiftId: { type: Schema.Types.Mixed, ref: 'SecurityShift', required: false },
  outgoingGuardId: { type: Schema.Types.Mixed, ref: 'Employee', required: false },
  incomingGuardId: { type: Schema.Types.Mixed, ref: 'Employee', required: false },
  handoverTime: { type: Date, required: true, default: Date.now },
  visitorsCurrentlyInside: { type: Number, default: 0 },
  vehiclesCurrentlyInside: { type: Number, default: 0 },
  openIncidents: { type: Number, default: 0 },
  pendingDeliveries: { type: Number, default: 0 },
  specialInstructions: String,
  openIssues: String,
  handoverNotes: String,
  acknowledgedByIncoming: { type: Boolean, default: false },
  acknowledgedAt: Date,
}, { timestamps: true });

[SecurityShiftSchema, ShiftHandoverSchema].forEach(s => s.plugin(softDeletePlugin));

export const SecurityShift = (mongoose.models['SecurityShift'] || mongoose.model<ISecurityShift>('SecurityShift', SecurityShiftSchema)) as any;
export const ShiftHandover = (mongoose.models['ShiftHandover'] || mongoose.model<IShiftHandover>('ShiftHandover', ShiftHandoverSchema)) as any;
