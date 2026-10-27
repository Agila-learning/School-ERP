import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IGraceBonusMark extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  marksEntryId?: mongoose.Types.ObjectId;
  type: 'GRACE' | 'BONUS';
  marksAdded: number;
  reason: string;
  approvedById: mongoose.Types.ObjectId;
}

const GraceBonusMarkSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  examId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  marksEntryId: { type: Schema.Types.ObjectId, ref: 'MarksEntry' },
  type: { type: String, enum: ['GRACE', 'BONUS'], required: true },
  marksAdded: { type: Number, required: true },
  reason: { type: String, required: true },
  approvedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

GraceBonusMarkSchema.plugin(softDeletePlugin);

export default (mongoose.models['GraceBonusMark'] || (mongoose.models['GraceBonusMark'] || mongoose.model<IGraceBonusMark>('GraceBonusMark', GraceBonusMarkSchema)) as any) as any;
