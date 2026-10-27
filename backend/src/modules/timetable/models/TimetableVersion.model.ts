import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITimetableVersion extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  termId?: mongoose.Types.ObjectId;
  name: string;
  versionNumber: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdByUserId: mongoose.Types.ObjectId;
  publishedByUserId?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  reason?: string;
  // Embedded constraint config — avoids a separate SchedulingConstraints collection
  constraints: {
    workingDays: Array<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'>;
    maxPeriodsPerDay: number;
    maxConsecutivePeriodsTeacher: number;
    maxConsecutivePeriodsSubject: number;
    allowDoublePeriodsForSubjects: string[]; // subjectIds
  };
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
}

const TimetableVersionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    termId: { type: Schema.Types.ObjectId, ref: 'Term' },
    name: { type: String, required: true },
    versionNumber: { type: Number, required: true },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: Date,
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    publishedAt: Date,
    reason: String,
    constraints: {
      workingDays: [{ type: String, enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] }],
      maxPeriodsPerDay: { type: Number, default: 8 },
      maxConsecutivePeriodsTeacher: { type: Number, default: 4 },
      maxConsecutivePeriodsSubject: { type: Number, default: 2 },
      allowDoublePeriodsForSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    },
    status: { type: String, enum: ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
  },
  { timestamps: true }
);

TimetableVersionSchema.index({ tenantId: 1, academicYearId: 1, branchId: 1, status: 1 });
TimetableVersionSchema.plugin(softDeletePlugin);
export default (mongoose.models['TimetableVersion'] || (mongoose.models['TimetableVersion'] || mongoose.model<ITimetableVersion>('TimetableVersion', TimetableVersionSchema)) as any) as any;
