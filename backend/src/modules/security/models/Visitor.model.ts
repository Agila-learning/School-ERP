import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type VisitorType = 'PARENT' | 'GUARDIAN' | 'ALUMNI' | 'VENDOR' | 'CONTRACTOR' | 'INTERVIEW_CANDIDATE' | 'GUEST' | 'CONSULTANT' | 'DELIVERY' | 'MAINTENANCE' | 'GOVERNMENT' | 'OTHER';
export type VisitorPassStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'USED' | 'CANCELLED';

export interface IVisitor extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  email?: string;
  organization?: string;
  visitorType: VisitorType;
  idType: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE' | 'OTHER';
  idReferenceMasked?: string; // Last 4 chars only
  photoUrl?: string;
  purpose?: string;
  hostEmployeeId?: mongoose.Types.ObjectId;
  hostDepartment?: string;
  notes?: string;
  status: 'ACTIVE' | 'BLOCKED';
}

export interface IVisitorPreRegistration extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  referenceCode: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail?: string;
  visitorOrganization?: string;
  visitorType: VisitorType;
  purpose: string;
  hostEmployeeId: mongoose.Types.ObjectId;
  hostDepartment?: string;
  visitDate: Date;
  expectedArrival: string;
  expectedExit: string;
  vehicleNumber?: string;
  remarks?: string;
  approvalStatus: 'PENDING_HOST' | 'PENDING_SECURITY' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'ARRIVED' | 'EXPIRED';
  hostConfirmedAt?: Date;
  securityApprovedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
}

export interface IVisitorPass extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  passId: string;
  visitorId: mongoose.Types.ObjectId;
  preRegistrationId?: mongoose.Types.ObjectId;
  hostEmployeeId?: mongoose.Types.ObjectId;
  purpose: string;
  entryTime: Date;
  expiryTime: Date;
  allowedAreas?: string[];
  gateId?: mongoose.Types.ObjectId;
  issuedBy: mongoose.Types.ObjectId;
  status: VisitorPassStatus;
  revokedBy?: mongoose.Types.ObjectId;
  revocationReason?: string;
  revokedAt?: Date;
  qrReference: string;
}

const VisitorSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  organization: String,
  visitorType: { type: String, enum: ['PARENT','GUARDIAN','ALUMNI','VENDOR','CONTRACTOR','INTERVIEW_CANDIDATE','GUEST','CONSULTANT','DELIVERY','MAINTENANCE','GOVERNMENT','OTHER'], default: 'PARENT' },
  idType: { type: String, enum: ['NATIONAL_ID','PASSPORT','DRIVING_LICENSE','OTHER'] },
  idReferenceMasked: String,
  photoUrl: String,
  purpose: String,
  hostEmployeeId: { type: Schema.Types.Mixed, ref: 'Employee' },
  hostDepartment: String,
  notes: String,
  status: { type: String, enum: ['ACTIVE','BLOCKED'], default: 'ACTIVE' },
}, { timestamps: true });

const VisitorPreRegistrationSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  referenceCode: { type: String, required: true, unique: true },
  visitorName: { type: String, required: true },
  visitorPhone: { type: String, required: true },
  visitorEmail: String,
  visitorOrganization: String,
  visitorType: { type: String, required: true },
  purpose: { type: String, required: true },
  hostEmployeeId: { type: Schema.Types.Mixed, ref: 'Employee', required: false, index: true },
  hostDepartment: String,
  visitDate: { type: Date, required: true, default: Date.now, index: true },
  expectedArrival: { type: String, required: true },
  expectedExit: { type: String, required: true },
  vehicleNumber: String,
  remarks: String,
  approvalStatus: { type: String, enum: ['PENDING_HOST','PENDING_SECURITY','APPROVED','REJECTED','CANCELLED','ARRIVED','EXPIRED'], default: 'PENDING_HOST', index: true },
  hostConfirmedAt: Date,
  securityApprovedAt: Date,
  approvedBy: { type: Schema.Types.Mixed, ref: 'User' },
  rejectionReason: String,
}, { timestamps: true });

const VisitorPassSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  passId: { type: String, required: true, unique: true },
  visitorId: { type: Schema.Types.Mixed, ref: 'Visitor', required: true, index: true },
  preRegistrationId: { type: Schema.Types.Mixed, ref: 'VisitorPreRegistration' },
  hostEmployeeId: { type: Schema.Types.Mixed, ref: 'Employee' },
  purpose: { type: String, required: true },
  entryTime: { type: Date, required: true, default: Date.now },
  expiryTime: { type: Date, required: true, index: true },
  allowedAreas: [String],
  gateId: { type: Schema.Types.Mixed, ref: 'Gate' },
  issuedBy: { type: Schema.Types.Mixed, ref: 'User', required: false },
  status: { type: String, enum: ['PENDING','ACTIVE','EXPIRED','REVOKED','USED','CANCELLED'], default: 'ACTIVE', index: true },
  revokedBy: { type: Schema.Types.Mixed, ref: 'User' },
  revocationReason: String,
  revokedAt: Date,
  qrReference: { type: String, required: true, unique: true },
}, { timestamps: true });

const VisitSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  visitorId: { type: String, required: true, index: true },
  visitorName: { type: String, required: true, index: true },
  phone: { type: String, required: true, index: true },
  email: String,
  organization: String,
  visitorCategory: { 
    type: String, 
    enum: ['GUEST','CUSTOMER','VENDOR','CONTRACTOR','INTERVIEW_CANDIDATE','PARENT','DELIVERY','GOVERNMENT','OTHER'], 
    default: 'GUEST',
    index: true 
  },
  hostEmployeeId: { type: Schema.Types.Mixed, ref: 'Employee', index: true },
  hostName: { type: String, required: true },
  hostDepartment: { type: String, default: 'General' },
  purpose: { type: String, required: true },
  expectedArrival: { type: Date, required: true, default: Date.now },
  expectedDeparture: { type: Date, required: true },
  actualCheckIn: Date,
  actualCheckOut: Date,
  durationMinutes: { type: Number, default: 0 },
  accompanyingCount: { type: Number, default: 0 },
  vehicleNumber: String,
  idDocumentType: { type: String, enum: ['NATIONAL_ID','PASSPORT','DRIVING_LICENSE','EMPLOYEE_ID','STUDENT_ID','OTHER'], default: 'NATIONAL_ID' },
  idDocumentReference: String,
  photoUrl: String,
  notes: String,
  approvalStatus: { 
    type: String, 
    enum: ['DRAFT','PENDING','APPROVED','REJECTED','CANCELLED','EXPIRED'], 
    default: 'APPROVED', 
    index: true 
  },
  approvalReason: String,
  approvedBy: { type: Schema.Types.Mixed, ref: 'User' },
  visitStatus: { 
    type: String, 
    enum: ['EXPECTED','INSIDE','CHECKED_OUT','OVERDUE','REJECTED','CANCELLED'], 
    default: 'EXPECTED', 
    index: true 
  },
  passId: { type: String, required: true, unique: true, index: true },
  passExpiry: { type: Date, required: true, index: true },
  qrToken: { type: String, required: true, unique: true, index: true },
  registrationSource: { 
    type: String, 
    enum: ['WALK_IN','PRE_REGISTERED','STAFF_INVITE','BULK_EVENT'], 
    default: 'WALK_IN' 
  },
  checkedInBy: { type: Schema.Types.Mixed, ref: 'User' },
  checkedOutBy: { type: Schema.Types.Mixed, ref: 'User' },
  checkoutNotes: String,
  extensions: [{
    extendedTo: Date,
    reason: String,
    approvedBy: { type: Schema.Types.Mixed, ref: 'User' },
    extendedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

[VisitorSchema, VisitorPreRegistrationSchema, VisitorPassSchema, VisitSchema].forEach(s => s.plugin(softDeletePlugin));

export const Visitor = (mongoose.models['Visitor'] || mongoose.model<IVisitor>('Visitor', VisitorSchema)) as any;
export const VisitorPreRegistration = (mongoose.models['VisitorPreRegistration'] || mongoose.model<IVisitorPreRegistration>('VisitorPreRegistration', VisitorPreRegistrationSchema)) as any;
export const VisitorPass = (mongoose.models['VisitorPass'] || mongoose.model<IVisitorPass>('VisitorPass', VisitorPassSchema)) as any;
export const Visit = (mongoose.models['Visit'] || mongoose.model('Visit', VisitSchema)) as any;

