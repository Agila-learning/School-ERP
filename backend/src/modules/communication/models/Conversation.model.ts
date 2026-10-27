import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  tenantId: any;
  type: 'ONE_TO_ONE' | 'GROUP';
  participants: Array<{
    userId: any;
    userType: string;
    joinedAt: Date;
  }>;
  relatedStudentId?: any;
  isActive: boolean;
  lastMessageAt?: Date;
  title?: string;
}

const ConversationSchema = new Schema(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    type: { type: String, enum: ['ONE_TO_ONE', 'GROUP'], default: 'ONE_TO_ONE' },
    title: { type: String },
    participants: [
      {
        userId: { type: Schema.Types.Mixed, required: true },
        userType: { type: String, default: 'EMPLOYEE' },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    relatedStudentId: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default (mongoose.models['Conversation'] ||
  mongoose.model<IConversation>('Conversation', ConversationSchema)) as any;
