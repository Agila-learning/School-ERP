import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  tenantId: any;
  conversationId: any;
  senderId: any;
  content: string;
  attachments?: string[];
  readBy: Array<{
    userId: any;
    readAt: Date;
  }>;
}

const MessageSchema = new Schema(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    conversationId: { type: Schema.Types.Mixed, required: true, index: true },
    senderId: { type: Schema.Types.Mixed, required: true },
    content: { type: String, required: true },
    attachments: [String],
    readBy: [
      {
        userId: { type: Schema.Types.Mixed },
        readAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default (mongoose.models['Message'] ||
  mongoose.model<IMessage>('Message', MessageSchema)) as any;
