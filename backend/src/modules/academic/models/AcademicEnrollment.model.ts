import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAcademicEnrollment extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  rollNumber?: string;
  admissionNumber: string;
  enrollmentDate: Date;
  status: 'ACTIVE' | 'PROMOTED' | 'RETAINED' | 'TRANSFERRED' | 'WITHDRAWN' | 'GRADUATED' | 'SUSPENDED';
}

const AcademicEnrollmentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: false, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: false, index: true },
    rollNumber: String,
    admissionNumber: { type: String, required: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'PROMOTED', 'RETAINED', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED', 'SUSPENDED'], 
      default: 'ACTIVE' 
    },
  },
  {
    timestamps: true,
  }
);

// A student can only have ONE active/inactive enrollment per academic year
AcademicEnrollmentSchema.index({ tenantId: 1, academicYearId: 1, studentId: 1 }, { unique: true });
// Roll numbers must be unique within a section per academic year
AcademicEnrollmentSchema.index({ tenantId: 1, academicYearId: 1, sectionId: 1, rollNumber: 1 }, { unique: true, partialFilterExpression: { rollNumber: { $exists: true, $ne: null } } });

AcademicEnrollmentSchema.plugin(softDeletePlugin);

export default (mongoose.models['AcademicEnrollment'] || (mongoose.models['AcademicEnrollment'] || mongoose.model<IAcademicEnrollment>('AcademicEnrollment', AcademicEnrollmentSchema)) as any) as any;
