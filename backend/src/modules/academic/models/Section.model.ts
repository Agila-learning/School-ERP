import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISection extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  name: string;
  code: string;
  capacity?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const SectionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    campusId: { type: Schema.Types.ObjectId, ref: 'Campus' },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    name: { type: String, required: true },
    code: { type: String, required: true },
    capacity: { type: Number, default: 30 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate section names within the same class and academic year
SectionSchema.index({ tenantId: 1, classId: 1, academicYearId: 1, name: 1 }, { unique: true });
SectionSchema.plugin(softDeletePlugin);

export default (mongoose.models['Section'] || (mongoose.models['Section'] || mongoose.model<ISection>('Section', SectionSchema)) as any) as any;
