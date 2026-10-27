import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssessmentComponent extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  name: string;       // e.g., Theory, Practical, Internal
  code: string;       // e.g., THE, PRA, INT
  description?: string;
  isActive: boolean;
}

const AssessmentComponentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AssessmentComponentSchema.index({ tenantId: 1, code: 1 }, { unique: true });
AssessmentComponentSchema.plugin(softDeletePlugin);

export default (mongoose.models['AssessmentComponent'] || (mongoose.models['AssessmentComponent'] || mongoose.model<IAssessmentComponent>('AssessmentComponent', AssessmentComponentSchema)) as any) as any;
