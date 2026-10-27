import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationPreference extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // Category preferences mapped to true/false
  preferences: {
    academicUpdates: boolean;
    events: boolean;
    library: boolean;
    transport: boolean;
    generalAnnouncements: boolean;
    promotional: boolean;
  };
  
  // Channel preferences
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  
  // Quiet hours mapping
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;
  };
}

const NotificationPreferenceSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  preferences: {
    academicUpdates: { type: Boolean, default: true },
    events: { type: Boolean, default: true },
    library: { type: Boolean, default: true },
    transport: { type: Boolean, default: true },
    generalAnnouncements: { type: Boolean, default: true },
    promotional: { type: Boolean, default: false }
  },
  
  channels: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false }
  },
  
  quietHours: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '22:00' },
    end: { type: String, default: '07:00' }
  }
}, { timestamps: true });

export default (mongoose.models['NotificationPreference'] || mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema)) as any;
