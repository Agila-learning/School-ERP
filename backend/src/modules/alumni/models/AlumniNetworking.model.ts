import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAlumniConnection extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId; // AlumniProfileId
  targetId: mongoose.Types.ObjectId; // AlumniProfileId
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Blocked' | 'Cancelled';
  dateRequested: Date;
  dateResponded?: Date;
}

export interface IAlumniGroup extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  groupName: string;
  description: string;
  category: 'Batch' | 'City' | 'Country' | 'Industry' | 'Interest' | 'Professional';
  createdBy: mongoose.Types.ObjectId; // AlumniProfileId
  memberCount: number;
}

export interface IAlumniGroupMember extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  alumniProfileId: mongoose.Types.ObjectId;
  role: 'Member' | 'Admin';
  joinDate: Date;
}

const AlumniConnectionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  requesterId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  targetId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  status: { type: String, default: 'Pending' },
  dateRequested: { type: Date, default: Date.now },
  dateResponded: Date,
}, { timestamps: true });

const AlumniGroupSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  groupName: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  memberCount: { type: Number, default: 1 },
}, { timestamps: true });

const AlumniGroupMemberSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  groupId: { type: Schema.Types.ObjectId, ref: 'AlumniGroup', required: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  role: { type: String, default: 'Member' },
  joinDate: { type: Date, default: Date.now },
}, { timestamps: true });

[AlumniConnectionSchema, AlumniGroupSchema, AlumniGroupMemberSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const AlumniConnection = (mongoose.models['AlumniConnection'] || mongoose.model<IAlumniConnection>('AlumniConnection', AlumniConnectionSchema)) as any;
export const AlumniGroup = (mongoose.models['AlumniGroup'] || mongoose.model<IAlumniGroup>('AlumniGroup', AlumniGroupSchema)) as any;
export const AlumniGroupMember = (mongoose.models['AlumniGroupMember'] || mongoose.model<IAlumniGroupMember>('AlumniGroupMember', AlumniGroupMemberSchema)) as any;
