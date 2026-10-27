import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ICommunicationTemplate extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g., 'Fee Reminder', 'Attendance Alert'
  description?: string;
  category: 'FEE' | 'ATTENDANCE' | 'EXAM' | 'HOLIDAY' | 'EVENT' | 'TRANSPORT' | 'LIBRARY' | 'GENERAL';
  channels: Array<'IN_APP' | 'PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP'>;
  
  // Subject and Content can have placeholders like {{studentName}}
  subject?: string;
  content: string; 
  
  variables: string[]; // List of expected variables
  
  version: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const CommunicationTemplateSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['FEE', 'ATTENDANCE', 'EXAM', 'HOLIDAY', 'EVENT', 'TRANSPORT', 'LIBRARY', 'GENERAL'],
    required: true
  },
  channels: [{ type: String, enum: ['IN_APP', 'PUSH', 'EMAIL', 'SMS', 'WHATSAPP'] }],
  
  subject: String,
  content: { type: String, required: true },
  
  variables: [String],
  
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

CommunicationTemplateSchema.plugin(softDeletePlugin);

export default (mongoose.models['CommunicationTemplate'] || mongoose.model<ICommunicationTemplate>('CommunicationTemplate', CommunicationTemplateSchema)) as any;
