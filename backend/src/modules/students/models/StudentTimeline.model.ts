import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentTimeline extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  eventType: 'ADMISSION' | 'ENROLLMENT' | 'CLASS_CHANGE' | 'SECTION_CHANGE' | 'PROMOTION' | 'DISCIPLINARY' | 'TRANSFER' | 'WITHDRAWAL' | 'GRADUATION' | 'OTHER';
  title: string;
  description?: string;
  eventDate: Date;
  referenceId?: string; // ID to a related record (e.g. PromotionRecord ID)
  performedByUserId: mongoose.Types.ObjectId;
}

const StudentTimelineSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    eventType: { 
      type: String, 
      enum: ['ADMISSION', 'ENROLLMENT', 'CLASS_CHANGE', 'SECTION_CHANGE', 'PROMOTION', 'DISCIPLINARY', 'TRANSFER', 'WITHDRAWAL', 'GRADUATION', 'OTHER'], 
      required: true 
    },
    title: { type: String, required: true },
    description: String,
    eventDate: { type: Date, default: Date.now },
    referenceId: String,
    performedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

StudentTimelineSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentTimeline'] || (mongoose.models['StudentTimeline'] || mongoose.model<IStudentTimeline>('StudentTimeline', StudentTimelineSchema)) as any) as any;
