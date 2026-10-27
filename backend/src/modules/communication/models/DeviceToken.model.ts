import mongoose, { Document, Schema } from 'mongoose';

export interface IDeviceToken extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  platform: 'IOS' | 'ANDROID' | 'WEB';
  appVersion?: string;
  
  status: 'ACTIVE' | 'INACTIVE' | 'REVOKED';
  lastActive: Date;
}

const DeviceTokenSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token: { type: String, required: true, unique: true },
  platform: {
    type: String,
    enum: ['IOS', 'ANDROID', 'WEB'],
    required: true
  },
  appVersion: String,
  
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'REVOKED'],
    default: 'ACTIVE'
  },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

export default (mongoose.models['DeviceToken'] || mongoose.model<IDeviceToken>('DeviceToken', DeviceTokenSchema)) as any;
