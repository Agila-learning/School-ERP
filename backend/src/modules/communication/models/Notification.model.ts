import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  tenantId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId; // User ID
  title: string;
  message: string;
  type: string; // e.g., 'SYSTEM', 'FEE', 'ATTENDANCE', 'EXAM', 'ASSIGNMENT'
  link?: string; // Optional URL or route to navigate to
  readStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['SYSTEM', 'FEE', 'ATTENDANCE', 'EXAM', 'ASSIGNMENT', 'MESSAGE', 'GENERAL'],
      default: 'GENERAL'
    },
    link: {
      type: String
    },
    readStatus: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for getting unread notifications quickly
NotificationSchema.index({ recipientId: 1, readStatus: 1 });
NotificationSchema.index({ tenantId: 1, recipientId: 1 });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
