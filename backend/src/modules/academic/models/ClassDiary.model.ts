import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IClassDiary extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId?: mongoose.Types.ObjectId; // Optional, if note is subject specific
  date: Date;
  title: string;
  description: string;
  activities?: string;
  homework?: string;
  remarks?: string;
  createdBy: mongoose.Types.ObjectId; // Teacher who created this
  status: 'DRAFT' | 'PUBLISHED';
}

const ClassDiarySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    date: { type: Date, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    activities: { type: String },
    homework: { type: String },
    remarks: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'PUBLISHED' },
  },
  {
    timestamps: true,
  }
);

ClassDiarySchema.plugin(softDeletePlugin);

export default (mongoose.models['ClassDiary'] || (mongoose.models['ClassDiary'] || mongoose.model<IClassDiary>('ClassDiary', ClassDiarySchema)) as any) as any;
