import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISectionAllocation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  targetClassId: mongoose.Types.ObjectId;
  assignedSectionId?: mongoose.Types.ObjectId;
  allocationMethod: 'AUTOMATIC' | 'MANUAL' | 'RULE_BASED' | 'STUDENT_REQUEST';
  status: 'PENDING' | 'ALLOCATED' | 'CONFLICT' | 'REJECTED';
  conflictReason?: string;
  allocatedByUserId?: mongoose.Types.ObjectId;
}

const SectionAllocationSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    targetClassId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    assignedSectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
    allocationMethod: { 
      type: String, 
      enum: ['AUTOMATIC', 'MANUAL', 'RULE_BASED', 'STUDENT_REQUEST'],
      default: 'AUTOMATIC'
    },
    status: { type: String, enum: ['PENDING', 'ALLOCATED', 'CONFLICT', 'REJECTED'], default: 'PENDING' },
    conflictReason: String,
    allocatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

SectionAllocationSchema.plugin(softDeletePlugin);

export default (mongoose.models['SectionAllocation'] || mongoose.model<ISectionAllocation>('SectionAllocation', SectionAllocationSchema)) as any;
