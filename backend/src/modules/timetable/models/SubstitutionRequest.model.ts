import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISubstitutionRequest extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  versionId: mongoose.Types.ObjectId;
  originalEntryId: mongoose.Types.ObjectId;
  originalTeacherEmployeeId: mongoose.Types.ObjectId;
  substituteTeacherEmployeeId?: mongoose.Types.ObjectId;
  date: Date;
  day: string;
  periodDefinitionId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  reason: string;
  requestedByUserId: mongoose.Types.ObjectId;
  assignedByUserId?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
}

const SubstitutionRequestSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    versionId: { type: Schema.Types.ObjectId, ref: 'TimetableVersion', required: true },
    originalEntryId: { type: Schema.Types.ObjectId, ref: 'TimetableEntry', required: true },
    originalTeacherEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    substituteTeacherEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    date: { type: Date, required: true },
    day: { type: String, required: true },
    periodDefinitionId: { type: Schema.Types.ObjectId, ref: 'PeriodDefinition', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    reason: { type: String, required: true },
    requestedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: Date,
    status: { type: String, enum: ['PENDING', 'ASSIGNED', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  },
  { timestamps: true }
);

SubstitutionRequestSchema.index({ tenantId: 1, date: 1, status: 1 });
SubstitutionRequestSchema.index({ tenantId: 1, originalTeacherEmployeeId: 1, date: 1 });
SubstitutionRequestSchema.plugin(softDeletePlugin);
export default (mongoose.models['SubstitutionRequest'] || (mongoose.models['SubstitutionRequest'] || mongoose.model<ISubstitutionRequest>('SubstitutionRequest', SubstitutionRequestSchema)) as any) as any;
