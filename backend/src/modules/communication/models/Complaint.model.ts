import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  tenantId: mongoose.Types.ObjectId;
  complaintNumber: string;
  
  type: 'ACADEMIC' | 'DISCIPLINE' | 'BULLYING' | 'TRANSPORT' | 'STAFF_BEHAVIOR' | 'FACILITIES' | 'OTHER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  
  subject: string;
  description: string;
  attachments?: string[];
  
  submittedBy: mongoose.Types.ObjectId; // User
  studentId?: mongoose.Types.ObjectId; // Context if submitted by parent
  
  status: 'OPEN' | 'ASSIGNED' | 'UNDER_REVIEW' | 'WAITING_FOR_INFO' | 'RESOLVED' | 'CLOSED' | 'REJECTED' | 'ESCALATED';
  
  assignedDepartment?: string;
  assignedTo?: mongoose.Types.ObjectId; // Employee
  
  slaDeadline?: Date;
  escalationLevel: number;
  
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
}

const ComplaintSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  complaintNumber: { type: String, required: true, unique: true },
  
  type: {
    type: String,
    enum: ['ACADEMIC', 'DISCIPLINE', 'BULLYING', 'TRANSPORT', 'STAFF_BEHAVIOR', 'FACILITIES', 'OTHER'],
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'],
    default: 'NORMAL'
  },
  
  subject: { type: String, required: true },
  description: { type: String, required: true },
  attachments: [String],
  
  submittedBy: { type: Schema.Types.Mixed, ref: 'User', required: true },
  studentId: { type: Schema.Types.Mixed, ref: 'StudentProfile' },
  
  status: {
    type: String,
    enum: ['OPEN', 'ASSIGNED', 'UNDER_REVIEW', 'WAITING_FOR_INFO', 'RESOLVED', 'CLOSED', 'REJECTED', 'ESCALATED'],
    default: 'OPEN',
    index: true
  },
  
  assignedDepartment: String,
  assignedTo: { type: Schema.Types.Mixed, ref: 'Employee' },
  
  slaDeadline: Date,
  escalationLevel: { type: Number, default: 0 },
  
  resolution: String,
  resolvedAt: Date,
  resolvedBy: { type: Schema.Types.Mixed, ref: 'User' }
}, { timestamps: true });

export default (mongoose.models['CommunicationComplaint'] || mongoose.model<IComplaint>('CommunicationComplaint', ComplaintSchema)) as any;
