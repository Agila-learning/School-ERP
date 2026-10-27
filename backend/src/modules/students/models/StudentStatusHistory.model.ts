import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentStatusHistory extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  previousStatus: string;
  newStatus: string;
  reason: string;
  effectiveDate: Date;
  changedByUserId: mongoose.Types.ObjectId;
}

const StudentStatusHistorySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    reason: { type: String, required: true },
    effectiveDate: { type: Date, required: true, default: Date.now },
    changedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

StudentStatusHistorySchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentStatusHistory'] || (mongoose.models['StudentStatusHistory'] || mongoose.model<IStudentStatusHistory>('StudentStatusHistory', StudentStatusHistorySchema)) as any) as any;
