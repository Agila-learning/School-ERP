import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelApplication extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;    // Ref: User
  academicYearId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  preferredHostelId?: mongoose.Types.ObjectId;
  preferredRoomType?: string;
  boardingType: string;
  startDate: Date;
  endDate?: Date;
  reason?: string;
  medicalRequirements?: string;
  parentConsentGiven: boolean;
  parentConsentTimestamp?: Date;
  reviewedByUserId?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED';
  waitlistPriority?: number;
}

const HostelApplicationSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  preferredHostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
  preferredRoomType: String,
  boardingType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  reason: String,
  medicalRequirements: String,
  parentConsentGiven: { type: Boolean, default: false },
  parentConsentTimestamp: Date,
  reviewedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: String,
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WAITLISTED', 'CANCELLED'],
    default: 'DRAFT',
  },
  waitlistPriority: Number,
}, { timestamps: true });

HostelApplicationSchema.plugin(softDeletePlugin);
export default (mongoose.models['HostelApplication'] || (mongoose.models['HostelApplication'] || mongoose.model<IHostelApplication>('HostelApplication', HostelApplicationSchema)) as any) as any;
