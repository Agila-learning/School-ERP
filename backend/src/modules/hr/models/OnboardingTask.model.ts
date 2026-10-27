import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IOnboardingTask extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  employeeId?: mongoose.Types.ObjectId; // Populated once employee is created
  taskName: string;
  description?: string;
  assignedToId: mongoose.Types.ObjectId; // Ref Employee (e.g. IT guy for laptop, HR for docs)
  dueDate: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  completedDate?: Date;
  remarks?: string;
}

const OnboardingTaskSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  taskName: { type: String, required: true },
  description: String,
  assignedToId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
    default: 'PENDING',
  },
  completedDate: Date,
  remarks: String,
}, { timestamps: true });

OnboardingTaskSchema.plugin(softDeletePlugin);

export default (mongoose.models['OnboardingTask'] || (mongoose.models['OnboardingTask'] || mongoose.model<IOnboardingTask>('OnboardingTask', OnboardingTaskSchema)) as any) as any;
