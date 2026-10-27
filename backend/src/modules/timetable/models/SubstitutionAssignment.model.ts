import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISubstitutionAssignment extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  date: Date;
  absentTeacherId: mongoose.Types.ObjectId; // The teacher who is absent
  substituteTeacherId: mongoose.Types.ObjectId; // The teacher who is taking the class
  periodId: mongoose.Types.ObjectId; // Which period
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  status: 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
  remarks?: string;
  assignedBy: mongoose.Types.ObjectId; // Admin/Coordinator who assigned this
}

const SubstitutionAssignmentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    date: { type: Date, required: true },
    absentTeacherId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    substituteTeacherId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    periodId: { type: Schema.Types.ObjectId, ref: 'PeriodDefinition', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    status: { type: String, enum: ['ASSIGNED', 'COMPLETED', 'CANCELLED'], default: 'ASSIGNED' },
    remarks: { type: String },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  },
  {
    timestamps: true,
  }
);

SubstitutionAssignmentSchema.plugin(softDeletePlugin);

export default (mongoose.models['SubstitutionAssignment'] || (mongoose.models['SubstitutionAssignment'] || mongoose.model<ISubstitutionAssignment>('SubstitutionAssignment', SubstitutionAssignmentSchema)) as any) as any;
