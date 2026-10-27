import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISupplementaryExam extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  linkedExamId: mongoose.Types.ObjectId; // Ref ExaminationMaster
  title: string;
  type: 'SUPPLEMENTARY' | 'MAKE_UP';
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ONGOING' | 'COMPLETED' | 'RESULTS_PUBLISHED';
}

const SupplementaryExamSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  linkedExamId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['SUPPLEMENTARY', 'MAKE_UP'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  status: { type: String, enum: ['DRAFT', 'OPEN', 'CLOSED', 'ONGOING', 'COMPLETED', 'RESULTS_PUBLISHED'], default: 'DRAFT' },
}, { timestamps: true });

SupplementaryExamSchema.plugin(softDeletePlugin);

export interface ISupplementaryRegistration extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  supplementaryExamId: mongoose.Types.ObjectId; // Ref SupplementaryExam
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  feePaid: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const SupplementaryRegistrationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  supplementaryExamId: { type: Schema.Types.ObjectId, ref: 'SupplementaryExam', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  feePaid: { type: Boolean, default: false },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true });

SupplementaryRegistrationSchema.index({ tenantId: 1, supplementaryExamId: 1, studentId: 1, subjectId: 1 }, { unique: true });
SupplementaryRegistrationSchema.plugin(softDeletePlugin);

export const SupplementaryExam = (mongoose.models['SupplementaryExam'] || mongoose.model<ISupplementaryExam>('SupplementaryExam', SupplementaryExamSchema)) as any;
export const SupplementaryRegistration = (mongoose.models['SupplementaryRegistration'] || mongoose.model<ISupplementaryRegistration>('SupplementaryRegistration', SupplementaryRegistrationSchema)) as any;
