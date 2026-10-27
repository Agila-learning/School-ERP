import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISecurityPatrol extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  patrolNumber: string;
  securityStaffId: mongoose.Types.ObjectId;
  zoneId?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  checkpoints: Array<{
    locationDetails: string;
    scannedTime?: Date;
    observations?: string;
    status: 'Pending' | 'Completed' | 'Missed';
  }>;
  overallObservations?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface IAccessEvent extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  personId?: mongoose.Types.ObjectId;
  personType: 'Student' | 'Employee' | 'Visitor' | 'Unknown';
  gateDetails: string;
  direction: 'Entry' | 'Exit';
  timestamp: Date;
  method: 'Manual' | 'QR' | 'RFID' | 'Biometric' | 'Card' | 'Other';
  authorizationReference?: string;
  status: 'Authorized' | 'Denied' | 'Anomaly';
  anomalyReason?: 'Invalid Pass' | 'Expired Pass' | 'Unauthorized Area' | 'Unknown Person' | 'Duplicate Access' | 'Access Outside Schedule';
}

export interface ILostFoundItem extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  itemId: string;
  itemName: string;
  category: string;
  status: 'Found' | 'Claimed' | 'Disposed' | 'Returned';
  locationDetails: string;
  dateReported: Date;
  reportedByUserId: mongoose.Types.ObjectId;
  description: string;
  photoUrl?: string;
  storageLocation?: string;
  claimantName?: string;
  claimantContact?: string;
  handoverDate?: Date;
}

const SecurityPatrolSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  patrolNumber: { type: String, required: true, unique: true },
  securityStaffId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  zoneId: { type: Schema.Types.Mixed, ref: 'SafetyZone' },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: Date,
  checkpoints: [{
    locationDetails: String,
    scannedTime: Date,
    observations: String,
    status: { type: String, enum: ['Pending', 'Completed', 'Missed'], default: 'Pending' }
  }],
  overallObservations: String,
  status: { type: String, default: 'Planned' },
}, { timestamps: true });

const AccessEventSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  personId: Schema.Types.Mixed,
  personType: { type: String, required: true },
  gateDetails: { type: String, required: true },
  direction: { type: String, enum: ['Entry', 'Exit'], default: 'Entry' },
  timestamp: { type: Date, required: true, default: Date.now },
  method: { type: String, default: 'Manual' },
  authorizationReference: String,
  status: { type: String, default: 'Authorized' },
  anomalyReason: String,
}, { timestamps: true });

const LostFoundItemSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  itemId: { type: String, required: true, unique: true },
  itemName: { type: String, required: true },
  category: { type: String, default: 'General' },
  status: { type: String, default: 'Found' },
  locationDetails: { type: String, default: 'Campus' },
  dateReported: { type: Date, default: Date.now },
  reportedByUserId: { type: Schema.Types.Mixed, ref: 'User', required: false },
  description: { type: String, default: 'Unclaimed item' },
  photoUrl: String,
  storageLocation: String,
  claimantName: String,
  claimantContact: String,
  handoverDate: Date,
}, { timestamps: true });

[SecurityPatrolSchema, AccessEventSchema, LostFoundItemSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const SecurityPatrol = (mongoose.models['SecurityPatrol'] || mongoose.model<ISecurityPatrol>('SecurityPatrol', SecurityPatrolSchema)) as any;
export const AccessEvent = (mongoose.models['AccessEvent'] || mongoose.model<IAccessEvent>('AccessEvent', AccessEventSchema)) as any;
export const LostFoundItem = (mongoose.models['LostFoundItem'] || mongoose.model<ILostFoundItem>('LostFoundItem', LostFoundItemSchema)) as any;
