import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISubjectGroup extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  subjectIds: mongoose.Types.ObjectId[];
  status: 'ACTIVE' | 'INACTIVE';
}

const SubjectGroupSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: String,
    subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

SubjectGroupSchema.index({ tenantId: 1, code: 1 }, { unique: true });
SubjectGroupSchema.plugin(softDeletePlugin);

export default (mongoose.models['SubjectGroup'] || (mongoose.models['SubjectGroup'] || mongoose.model<ISubjectGroup>('SubjectGroup', SubjectGroupSchema)) as any) as any;
