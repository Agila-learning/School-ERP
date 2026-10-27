import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

/**
 * ### Collection Name
 * Terms
 * 
 * ### Purpose
 * Represents a term/semester within an academic year (e.g., Term 1, Fall Semester).
 * 
 * ### Domain
 * Academic
 * 
 * ### Indexes
 * - { tenantId: 1, academicYearId: 1, name: 1 } (Unique)
 * 
 * ### Relationships
 * - Belongs to AcademicYear
 */

export interface ITerm extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
}

const TermSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    academicYearId: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TermSchema.index({ tenantId: 1, academicYearId: 1, name: 1 }, { unique: true });
TermSchema.plugin(softDeletePlugin);

export default (mongoose.models['Term'] || (mongoose.models['Term'] || mongoose.model<ITerm>('Term', TermSchema)) as any) as any;
