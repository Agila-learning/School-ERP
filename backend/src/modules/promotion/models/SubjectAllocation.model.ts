import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISubjectAllocation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  allocationType: 'CORE' | 'ELECTIVE' | 'OPTIONAL' | 'LANGUAGE' | 'PRACTICAL';
  status: 'PENDING' | 'SELECTED' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'ALLOCATED' | 'CHANGED' | 'CANCELLED';
  approvedByUserId?: mongoose.Types.ObjectId;
}

const SubjectAllocationSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    allocationType: { 
      type: String, 
      enum: ['CORE', 'ELECTIVE', 'OPTIONAL', 'LANGUAGE', 'PRACTICAL'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['PENDING', 'SELECTED', 'APPROVED', 'REJECTED', 'WAITLISTED', 'ALLOCATED', 'CHANGED', 'CANCELLED'], 
      default: 'PENDING' 
    },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

SubjectAllocationSchema.plugin(softDeletePlugin);

export default (mongoose.models['SubjectAllocation'] || mongoose.model<ISubjectAllocation>('SubjectAllocation', SubjectAllocationSchema)) as any;
