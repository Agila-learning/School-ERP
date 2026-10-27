import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAcademicEvent extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'VACATION' | 'OTHER';
  targetType: 'SCHOOL' | 'BRANCH' | 'CAMPUS' | 'CLASS' | 'SECTION' | 'DEPARTMENT';
  targetIds?: mongoose.Types.ObjectId[]; // Based on targetType
}

const AcademicEventSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    title: { type: String, required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { 
      type: String, 
      enum: ['HOLIDAY', 'EXAM', 'EVENT', 'VACATION', 'OTHER'], 
      required: true 
    },
    targetType: {
      type: String,
      enum: ['SCHOOL', 'BRANCH', 'CAMPUS', 'CLASS', 'SECTION', 'DEPARTMENT'],
      required: true,
      default: 'SCHOOL',
    },
    targetIds: [{ type: Schema.Types.ObjectId }],
  },
  {
    timestamps: true,
  }
);

AcademicEventSchema.plugin(softDeletePlugin);

export default (mongoose.models['AcademicEvent'] || (mongoose.models['AcademicEvent'] || mongoose.model<IAcademicEvent>('AcademicEvent', AcademicEventSchema)) as any) as any;
