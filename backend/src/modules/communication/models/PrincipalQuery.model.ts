import mongoose, { Document, Schema } from 'mongoose';

export interface IPrincipalQuery extends Document {
  tenantId: string;
  senderId: string;
  senderName: string;
  senderRole: 'TEACHER' | 'STAFF' | 'DRIVER' | 'PARENT' | 'STUDENT';
  category: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  subject: string;
  message: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
  principalReply?: string;
  repliedAt?: Date;
  repliedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrincipalQuerySchema = new Schema<IPrincipalQuery>(
  {
    tenantId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: {
      type: String,
      enum: ['TEACHER', 'STAFF', 'DRIVER', 'PARENT', 'STUDENT'],
      required: true,
      index: true
    },
    category: { type: String, default: 'ACADEMIC' },
    priority: { type: String, enum: ['NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    principalReply: { type: String },
    repliedAt: { type: Date },
    repliedBy: { type: String }
  },
  { timestamps: true }
);

export default (mongoose.models['PrincipalQuery'] ||
  mongoose.model<IPrincipalQuery>('PrincipalQuery', PrincipalQuerySchema)) as any;
