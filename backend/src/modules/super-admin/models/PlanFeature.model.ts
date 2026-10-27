import mongoose, { Document, Schema } from 'mongoose';

export interface IPlanFeature extends Document {
  code: string;
  name: string;
  description?: string;
  category: 'ACADEMIC' | 'HR' | 'FINANCE' | 'COMMUNICATION' | 'OPERATIONS' | 'PLATFORM' | 'ADVANCED';
  status: 'ACTIVE' | 'INACTIVE' | 'BETA' | 'DEPRECATED';
  icon?: string;
  sortOrder?: number;
}

const PlanFeatureSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ['ACADEMIC', 'HR', 'FINANCE', 'COMMUNICATION', 'OPERATIONS', 'PLATFORM', 'ADVANCED'],
      default: 'ACADEMIC',
    },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'BETA', 'DEPRECATED'], default: 'ACTIVE' },
    icon: String,
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default (mongoose.models['PlanFeature'] || mongoose.model<IPlanFeature>('PlanFeature', PlanFeatureSchema)) as any;
