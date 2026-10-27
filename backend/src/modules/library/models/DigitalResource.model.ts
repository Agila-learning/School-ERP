import mongoose, { Document, Schema } from 'mongoose';

export interface IDigitalResource extends Document {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  author?: string;
  categoryId?: mongoose.Types.ObjectId;
  resourceType: 'EBOOK' | 'PDF' | 'VIDEO' | 'AUDIO' | 'JOURNAL' | 'WEBSITE';
  url: string;
  accessRestrictions: 'PUBLIC' | 'STUDENT_ONLY' | 'TEACHER_ONLY' | 'STAFF_ONLY' | 'CLASS_SPECIFIC';
  allowedClassIds?: mongoose.Types.ObjectId[];
  licenseProvider?: string;
  licenseCost?: number;
  licenseStart?: Date;
  licenseExpiry?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DigitalResourceSchema = new Schema<IDigitalResource>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: true },
    author: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    resourceType: { type: String, enum: ['EBOOK', 'PDF', 'VIDEO', 'AUDIO', 'JOURNAL', 'WEBSITE'], required: true },
    url: { type: String, required: true },
    accessRestrictions: { 
      type: String, 
      enum: ['PUBLIC', 'STUDENT_ONLY', 'TEACHER_ONLY', 'STAFF_ONLY', 'CLASS_SPECIFIC'], 
      default: 'PUBLIC' 
    },
    allowedClassIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    licenseProvider: { type: String },
    licenseCost: { type: Number },
    licenseStart: { type: Date },
    licenseExpiry: { type: Date },
    status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'REVOKED'], default: 'ACTIVE' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DigitalResource = (mongoose.models['DigitalResource'] || mongoose.model<IDigitalResource>('DigitalResource', DigitalResourceSchema)) as any;
export default DigitalResource;
