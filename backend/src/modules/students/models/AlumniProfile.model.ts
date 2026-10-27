import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAlumniProfile extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId; // Original student user ID
  graduationYear: number;
  finalClassId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  achievements?: string;
  higherEducation?: {
    institution: string;
    course: string;
    startYear: number;
    endYear?: number;
  }[];
  employment?: {
    company: string;
    designation: string;
    location?: string;
    startDate?: Date;
    current: boolean;
  }[];
  alumniActivities?: string;
}

const AlumniProfileSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    graduationYear: { type: Number, required: true },
    finalClassId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    achievements: String,
    higherEducation: [{
      institution: { type: String, required: true },
      course: { type: String, required: true },
      startYear: { type: Number, required: true },
      endYear: Number,
    }],
    employment: [{
      company: { type: String, required: true },
      designation: { type: String, required: true },
      location: String,
      startDate: Date,
      current: { type: Boolean, default: true }
    }],
    alumniActivities: String,
  },
  { timestamps: true }
);

AlumniProfileSchema.plugin(softDeletePlugin);

export default (mongoose.models['AlumniProfile'] || (mongoose.models['AlumniProfile'] || mongoose.model<IAlumniProfile>('AlumniProfile', AlumniProfileSchema)) as any) as any;
