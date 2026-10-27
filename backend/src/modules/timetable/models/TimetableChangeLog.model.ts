import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITimetableChangeLog extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  versionId: mongoose.Types.ObjectId;
  entryId: mongoose.Types.ObjectId;
  changedByUserId: mongoose.Types.ObjectId;
  reason?: string;
  previousState: Record<string, any>;
  newState: Record<string, any>;
}

const TimetableChangeLogSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    versionId: { type: Schema.Types.ObjectId, ref: 'TimetableVersion', required: true, index: true },
    entryId: { type: Schema.Types.ObjectId, ref: 'TimetableEntry', required: true },
    changedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: String,
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

TimetableChangeLogSchema.plugin(softDeletePlugin);
export default (mongoose.models['TimetableChangeLog'] || (mongoose.models['TimetableChangeLog'] || mongoose.model<ITimetableChangeLog>('TimetableChangeLog', TimetableChangeLogSchema)) as any) as any;
