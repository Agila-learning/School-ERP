import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IClassTeacherAssignment extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  isPrimary: boolean; // True if this is the main class teacher, false if co-teacher
  startDate?: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'INACTIVE';
}

const ClassTeacherAssignmentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    isPrimary: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

ClassTeacherAssignmentSchema.index({ tenantId: 1, academicYearId: 1, sectionId: 1, teacherId: 1 }, { unique: true });
ClassTeacherAssignmentSchema.plugin(softDeletePlugin);

export default (mongoose.models['ClassTeacherAssignment'] || (mongoose.models['ClassTeacherAssignment'] || mongoose.model<IClassTeacherAssignment>('ClassTeacherAssignment', ClassTeacherAssignmentSchema)) as any) as any;
