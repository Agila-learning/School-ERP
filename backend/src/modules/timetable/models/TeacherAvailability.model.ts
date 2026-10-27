import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITeacherAvailability extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  teacherEmployeeId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  periodDefinitionId: mongoose.Types.ObjectId;
  reason?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

const TeacherAvailabilitySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    teacherEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    day: { type: String, enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], required: true },
    periodDefinitionId: { type: Schema.Types.ObjectId, ref: 'PeriodDefinition', required: true },
    reason: String,
    effectiveFrom: Date,
    effectiveTo: Date,
  },
  { timestamps: true }
);

TeacherAvailabilitySchema.index({ tenantId: 1, teacherEmployeeId: 1, day: 1 });
TeacherAvailabilitySchema.plugin(softDeletePlugin);
export default (mongoose.models['TeacherAvailability'] || (mongoose.models['TeacherAvailability'] || mongoose.model<ITeacherAvailability>('TeacherAvailability', TeacherAvailabilitySchema)) as any) as any;
