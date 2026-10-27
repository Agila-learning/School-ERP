import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IGraduationRecord extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  completionDate: Date;
  overallResult: string;
  eligibilityStatus: 'ELIGIBLE' | 'NOT_ELIGIBLE';
  certificateStatus: 'PENDING' | 'ISSUED' | 'WITHHELD';
  status: 'PENDING' | 'APPROVED' | 'GRADUATED' | 'WITHHELD' | 'TRANSFERRED';
  approvedByUserId?: mongoose.Types.ObjectId;
}

const GraduationRecordSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    programId: { type: Schema.Types.ObjectId, ref: 'Program' },
    completionDate: { type: Date, required: true },
    overallResult: { type: String, required: true },
    eligibilityStatus: { type: String, enum: ['ELIGIBLE', 'NOT_ELIGIBLE'], required: true },
    certificateStatus: { type: String, enum: ['PENDING', 'ISSUED', 'WITHHELD'], default: 'PENDING' },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'GRADUATED', 'WITHHELD', 'TRANSFERRED'], default: 'PENDING' },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

GraduationRecordSchema.plugin(softDeletePlugin);

export default (mongoose.models['GraduationRecord'] || mongoose.model<IGraduationRecord>('GraduationRecord', GraduationRecordSchema)) as any;
