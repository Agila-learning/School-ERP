import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITeacherProfile extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  teacherIdNumber?: string;
  subjectSpecialization: string[];
  teachingExperienceYears: number;
  gradeLevels: string[];
  preferredSubjects: string[];
  academicStatus: 'ACTIVE' | 'INACTIVE';
}

const TeacherProfileSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    teacherIdNumber: String,
    subjectSpecialization: [{ type: String }],
    teachingExperienceYears: { type: Number, default: 0 },
    gradeLevels: [{ type: String }],
    preferredSubjects: [{ type: String }],
    academicStatus: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

TeacherProfileSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });
TeacherProfileSchema.plugin(softDeletePlugin);

export default (mongoose.models['TeacherProfile'] || (mongoose.models['TeacherProfile'] || mongoose.model<ITeacherProfile>('TeacherProfile', TeacherProfileSchema)) as any) as any;
