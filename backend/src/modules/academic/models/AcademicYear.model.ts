import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

/**
 * ### Collection Name
 * AcademicYears
 * 
 * ### Purpose
 * Represents a full academic year (e.g., 2024-2025). Defines the boundary of academic sessions.
 * 
 * ### Domain
 * Academic
 * 
 * ### Indexes
 * - { tenantId: 1, name: 1 } (Unique) - Ensures no duplicate academic years per school.
 * 
 * ### Relationships
 * - One Tenant has Many AcademicYears
 * - One AcademicYear has Many Terms
 * 
 * ### Business Rules
 * - Only one academic year can be 'active' at a time per tenant.
 */

export interface IAcademicYear extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId; // Optional: Allows sharing across branches or specific to one
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
}

const AcademicYearSchema: Schema = new Schema(
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
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

AcademicYearSchema.index({ tenantId: 1, name: 1 }, { unique: true });
AcademicYearSchema.plugin(softDeletePlugin);

export default (mongoose.models['AcademicYear'] || (mongoose.models['AcademicYear'] || mongoose.model<IAcademicYear>('AcademicYear', AcademicYearSchema)) as any) as any;
