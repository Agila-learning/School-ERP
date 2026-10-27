import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformSetting extends Document {
  key: string;
  value: any;
  label: string;
  description?: string;
  category: string;
  isSecret: boolean;
  updatedBy?: mongoose.Types.ObjectId;
}

const PlatformSettingSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed },
    label: { type: String, required: true },
    description: String,
    category: { type: String, default: 'GENERAL' },
    isSecret: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default (mongoose.models['PlatformSetting'] || mongoose.model<IPlatformSetting>('PlatformSetting', PlatformSettingSchema)) as any;
