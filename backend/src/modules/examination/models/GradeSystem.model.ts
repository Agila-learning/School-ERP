import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IGradeRule {
  name: string;        // e.g., A+
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;  // e.g., 4.0
  isPassing: boolean;
  description?: string;
}

export interface IGradeSystem extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  name: string;        // e.g., CBSE 10-point, Custom School Grade
  code: string;
  rules: IGradeRule[];
  isDefault: boolean;
  isActive: boolean;
}

const GradeSystemSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    rules: [
      {
        name: { type: String, required: true },
        minPercentage: { type: Number, required: true },
        maxPercentage: { type: Number, required: true },
        gradePoint: { type: Number, required: true },
        isPassing: { type: Boolean, default: true },
        description: String,
      },
    ],
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

GradeSystemSchema.index({ tenantId: 1, code: 1 }, { unique: true });
GradeSystemSchema.plugin(softDeletePlugin);

export default (mongoose.models['GradeSystem'] || (mongoose.models['GradeSystem'] || mongoose.model<IGradeSystem>('GradeSystem', GradeSystemSchema)) as any) as any;
