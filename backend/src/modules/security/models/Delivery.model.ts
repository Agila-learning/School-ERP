import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IDeliveryEntry extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  deliveryNumber: string;
  deliveryPersonName: string;
  deliveryCompany: string;
  vehicleNumber?: string;
  expectedRecipientName: string;
  recipientDepartment?: string;
  recipientEmployeeId?: mongoose.Types.ObjectId;
  packageDescription: string;
  entryTime: Date;
  exitTime?: Date;
  passId?: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  deliveryConfirmedBy?: mongoose.Types.ObjectId;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'DELIVERED' | 'REJECTED' | 'EXITED';
}

export interface IContractorAccess extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  contractorName: string;
  company: string;
  workOrderReference?: string;
  hostDepartment: string;
  hostEmployeeId?: mongoose.Types.ObjectId;
  allowedAreas: string[];
  startDate: Date;
  endDate: Date;
  accessLevel: 'ESCORTED' | 'SUPERVISED' | 'INDEPENDENT';
  documents?: string[];
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'COMPLETED';
  revokedBy?: mongoose.Types.ObjectId;
  revokedAt?: Date;
}

const DeliveryEntrySchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  deliveryNumber: { type: String, required: true, unique: true },
  deliveryPersonName: { type: String, required: true },
  deliveryCompany: { type: String, required: true },
  vehicleNumber: String,
  expectedRecipientName: { type: String, required: true },
  recipientDepartment: String,
  recipientEmployeeId: { type: Schema.Types.Mixed, ref: 'Employee' },
  packageDescription: { type: String, required: true },
  entryTime: { type: Date, required: true, default: Date.now, index: true },
  exitTime: Date,
  passId: { type: Schema.Types.Mixed, ref: 'GatePass' },
  recordedBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  deliveryConfirmedBy: { type: Schema.Types.Mixed, ref: 'User' },
  status: { type: String, enum: ['PENDING_CONFIRMATION','CONFIRMED','DELIVERED','REJECTED','EXITED'], default: 'PENDING_CONFIRMATION', index: true },
}, { timestamps: true });

const ContractorAccessSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  contractorName: { type: String, required: true },
  company: { type: String, required: true },
  workOrderReference: String,
  hostDepartment: { type: String, required: true },
  hostEmployeeId: { type: Schema.Types.Mixed, ref: 'Employee' },
  allowedAreas: [String],
  startDate: { type: Date, required: true, default: Date.now, index: true },
  endDate: { type: Date, required: true, index: true },
  accessLevel: { type: String, enum: ['ESCORTED','SUPERVISED','INDEPENDENT'], default: 'SUPERVISED' },
  documents: [String],
  status: { type: String, enum: ['ACTIVE','EXPIRED','REVOKED','COMPLETED'], default: 'ACTIVE', index: true },
  revokedBy: { type: Schema.Types.Mixed, ref: 'User' },
  revokedAt: Date,
}, { timestamps: true });

[DeliveryEntrySchema, ContractorAccessSchema].forEach(s => s.plugin(softDeletePlugin));

export const DeliveryEntry = (mongoose.models['DeliveryEntry'] || mongoose.model<IDeliveryEntry>('DeliveryEntry', DeliveryEntrySchema)) as any;
export const ContractorAccess = (mongoose.models['ContractorAccess'] || mongoose.model<IContractorAccess>('ContractorAccess', ContractorAccessSchema)) as any;
