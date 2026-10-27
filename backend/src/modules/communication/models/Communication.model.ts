import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ICommunication extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  content: string; // Rich text / HTML
  type: 'ANNOUNCEMENT' | 'CIRCULAR' | 'NOTICE' | 'GENERAL' | 'ACADEMIC' | 'FEE' | 'TRANSPORT' | 'LIBRARY' | 'EMERGENCY' | 'CAMPAIGN' | 'CUSTOM' | 'FESTIVAL' | 'CULTURAL';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY';
  
  circularNumber?: string; // Auto-generated for formal circulars
  
  // Audience Targeting Criteria (stored as snapshot of intended target at generation time)
  audienceConfig: {
    targetType: 'ALL' | 'BRANCH' | 'GRADE' | 'SECTION' | 'CLASS' | 'STUDENTS' | 'PARENTS' | 'TEACHERS' | 'EMPLOYEES' | 'CUSTOM';
    branchId?: mongoose.Types.ObjectId[];
    gradeId?: mongoose.Types.ObjectId[];
    sectionId?: mongoose.Types.ObjectId[];
    specificUsers?: mongoose.Types.ObjectId[];
  };
  
  // Actually resolved list of user IDs at the time of send
  recipientSnapshot: mongoose.Types.ObjectId[];
  
  channels: Array<'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP'>;
  attachments?: string[]; // S3 keys or URLs
  
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'EXPIRED' | 'CANCELLED' | 'ARCHIVED';
  
  requireAcknowledgement: boolean;
  
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  expiryDate?: Date;
  scheduledFor?: Date;
}

const CommunicationSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['ANNOUNCEMENT', 'CIRCULAR', 'NOTICE', 'GENERAL', 'ACADEMIC', 'FEE', 'TRANSPORT', 'LIBRARY', 'EMERGENCY', 'CAMPAIGN', 'CUSTOM', 'FESTIVAL', 'CULTURAL'],
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY'],
    default: 'NORMAL'
  },
  circularNumber: String,
  
  audienceConfig: {
    targetType: { type: String, required: true },
    branchId: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
    gradeId: [{ type: Schema.Types.ObjectId }],
    sectionId: [{ type: Schema.Types.ObjectId }],
    specificUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  
  recipientSnapshot: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  channels: [{ type: String, enum: ['IN_APP', 'PUSH', 'EMAIL', 'SMS', 'WHATSAPP'] }],
  attachments: [String],
  
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'EXPIRED', 'CANCELLED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  
  requireAcknowledgement: { type: Boolean, default: false },
  
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  publishedAt: Date,
  expiryDate: Date,
  scheduledFor: Date
}, { timestamps: true });

CommunicationSchema.plugin(softDeletePlugin);

export default (mongoose.models['Communication'] || mongoose.model<ICommunication>('Communication', CommunicationSchema)) as any;
