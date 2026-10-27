import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

/**
 * TeacherAssignment Model
 * Tracks which teacher is assigned to which class/section/subject per academic year.
 * This is the foundation for assignment-level RBAC.
 */
export interface ITeacherAssignment extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;  // ref: Employee
  userId: mongoose.Types.ObjectId;     // ref: User (for quick auth lookup)
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  isClassCoordinator: boolean;
  isExaminationIncharge: boolean;
  startDate?: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'INACTIVE';
}

const TeacherAssignmentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    isClassCoordinator: { type: Boolean, default: false },
    isExaminationIncharge: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

// Unique: a teacher can only have one assignment per class+section+subject per year
TeacherAssignmentSchema.index(
  { tenantId: 1, academicYearId: 1, classId: 1, sectionId: 1, subjectId: 1, teacherId: 1 },
  { unique: true }
);

TeacherAssignmentSchema.plugin(softDeletePlugin);

export default (
  mongoose.models['TeacherAssignment'] ||
  mongoose.model<ITeacherAssignment>('TeacherAssignment', TeacherAssignmentSchema)
) as any;
