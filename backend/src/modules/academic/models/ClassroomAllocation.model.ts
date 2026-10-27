import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IClassroomAllocation extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
}

const ClassroomAllocationSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Prevent the same room from being allocated to multiple sections in the same academic year
ClassroomAllocationSchema.index({ tenantId: 1, academicYearId: 1, roomId: 1 }, { unique: true });
// Prevent a section from being allocated multiple rooms in the same academic year
ClassroomAllocationSchema.index({ tenantId: 1, academicYearId: 1, sectionId: 1 }, { unique: true });

ClassroomAllocationSchema.plugin(softDeletePlugin);

export default (mongoose.models['ClassroomAllocation'] || (mongoose.models['ClassroomAllocation'] || mongoose.model<IClassroomAllocation>('ClassroomAllocation', ClassroomAllocationSchema)) as any) as any;
