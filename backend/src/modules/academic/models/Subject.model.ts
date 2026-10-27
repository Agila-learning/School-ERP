import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISubject extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  shortName?: string;
  typeId?: string; // Reference to MasterData (Core, Elective, Practical)
  categoryId?: string; // Reference to MasterData
  description?: string;
  creditHours?: number;
  maximumMarks?: number;
  passingMarks?: number;
  theoryMarks?: number;
  practicalMarks?: number;
  internalMarks?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const SubjectSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    shortName: String,
    typeId: String, // Kept as string reference for flexibility with MasterData
    categoryId: String,
    description: String,
    creditHours: { type: Number, default: 0 },
    maximumMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 40 },
    theoryMarks: Number,
    practicalMarks: Number,
    internalMarks: Number,
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

SubjectSchema.index({ tenantId: 1, code: 1 }, { unique: true });
SubjectSchema.plugin(softDeletePlugin);

export default (mongoose.models['Subject'] || (mongoose.models['Subject'] || mongoose.model<ISubject>('Subject', SubjectSchema)) as any) as any;
