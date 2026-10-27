import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  tenantId: mongoose.Types.ObjectId;
  category: 'ACADEMIC' | 'FACILITY' | 'TRANSPORT' | 'FOOD' | 'OTHER';
  subject: string;
  message: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  attachments?: string[];
  
  submittedBy: mongoose.Types.ObjectId;
  
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACKNOWLEDGED' | 'CLOSED';
  assignedTo?: mongoose.Types.ObjectId;
  
  response?: string;
  respondedAt?: Date;
  respondedBy?: mongoose.Types.ObjectId;
}

const FeedbackSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  category: {
    type: String,
    enum: ['ACADEMIC', 'FACILITY', 'TRANSPORT', 'FOOD', 'OTHER'],
    required: true
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH'],
    default: 'NORMAL'
  },
  attachments: [String],
  
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  status: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'ACKNOWLEDGED', 'CLOSED'],
    default: 'SUBMITTED'
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Employee' },
  
  response: String,
  respondedAt: Date,
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default (mongoose.models['Feedback'] || mongoose.model<IFeedback>('Feedback', FeedbackSchema)) as any;
