import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILabSession extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  laboratoryId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  sessionDate: Date;
  startTime: string;
  endTime: string;
  topic: string;
  attendanceStatus: 'PENDING' | 'MARKED';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  remarks?: string;
}

const LabSessionSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  branchId: { type: Schema.Types.Mixed },
  academicYearId: { type: Schema.Types.Mixed },
  laboratoryId: { type: Schema.Types.Mixed, ref: 'Laboratory' },
  laboratoryName: String,
  classId: { type: Schema.Types.Mixed, ref: 'Class' },
  className: String,
  sectionId: { type: Schema.Types.Mixed, ref: 'Section' },
  subjectId: { type: Schema.Types.Mixed, ref: 'Subject' },
  subjectName: String,
  teacherId: { type: Schema.Types.Mixed, ref: 'Employee' },
  teacherName: String,
  sessionDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  topic: { type: String, required: true },
  attendanceStatus: { type: String, enum: ['PENDING', 'MARKED'], default: 'PENDING' },
  status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
  remarks: String,
}, { timestamps: true });

LabSessionSchema.index({ tenantId: 1, sessionDate: 1 });
LabSessionSchema.plugin(softDeletePlugin);
export default (mongoose.models['LabSession'] || mongoose.model<ILabSession>('LabSession', LabSessionSchema)) as any;
