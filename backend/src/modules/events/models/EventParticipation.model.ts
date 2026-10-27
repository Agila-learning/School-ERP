import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEventParticipant extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  participantType: 'Student' | 'Teacher' | 'Parent' | 'Alumni' | 'Staff' | 'External';
  participantId: mongoose.Types.ObjectId;
  registrationStatus: 'Waitlist' | 'Registered' | 'Cancelled';
  paymentStatus: 'Not Required' | 'Pending' | 'Paid' | 'Refunded';
  registrationDate: Date;
}

export interface IEventPermission extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  permissionType: 'General' | 'Trip' | 'Medical' | 'Media';
  consentStatus: 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';
  consentDate?: Date;
  digitalSignature?: string;
  remarks?: string;
}

export interface IEventAttendance extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  status: 'Expected' | 'Present' | 'Absent' | 'Late' | 'Excused';
  checkInTime?: Date;
  checkOutTime?: Date;
  markedBy?: mongoose.Types.ObjectId; // User ID
  method: 'QR' | 'Manual' | 'RFID';
}

const EventParticipantSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  participantType: { type: String, required: true },
  participantId: { type: Schema.Types.ObjectId, required: true },
  registrationStatus: { type: String, default: 'Registered' },
  paymentStatus: { type: String, default: 'Not Required' },
  registrationDate: { type: Date, default: Date.now },
}, { timestamps: true });

const EventPermissionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  parentId: { type: Schema.Types.ObjectId, required: true },
  permissionType: { type: String, default: 'General' },
  consentStatus: { type: String, default: 'Pending' },
  consentDate: Date,
  digitalSignature: String,
  remarks: String,
}, { timestamps: true });

const EventAttendanceSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  participantId: { type: Schema.Types.ObjectId, required: true },
  status: { type: String, default: 'Expected' },
  checkInTime: Date,
  checkOutTime: Date,
  markedBy: { type: Schema.Types.ObjectId },
  method: { type: String, default: 'Manual' },
}, { timestamps: true });

[EventParticipantSchema, EventPermissionSchema, EventAttendanceSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const EventParticipant = (mongoose.models['EventParticipant'] || mongoose.model<IEventParticipant>('EventParticipant', EventParticipantSchema)) as any;
export const EventPermission = (mongoose.models['EventPermission'] || mongoose.model<IEventPermission>('EventPermission', EventPermissionSchema)) as any;
export const EventAttendance = (mongoose.models['EventAttendance'] || mongoose.model<IEventAttendance>('EventAttendance', EventAttendanceSchema)) as any;
