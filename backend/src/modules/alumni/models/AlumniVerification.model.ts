import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAlumniVerification extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniProfileId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  graduationRecordId: mongoose.Types.ObjectId;
  requestDate: Date;
  status: 'Pending' | 'Verified' | 'Rejected' | 'Needs Correction';
  verifiedBy?: mongoose.Types.ObjectId; // User
  verificationDate?: Date;
  adminNotes?: string;
}

const AlumniVerificationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  graduationRecordId: { type: Schema.Types.ObjectId, ref: 'GraduationRecord', required: true },
  requestDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected', 'Needs Correction'], default: 'Pending' },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verificationDate: Date,
  adminNotes: String,
}, { timestamps: true });

AlumniVerificationSchema.plugin(softDeletePlugin);

export const AlumniVerification = (mongoose.models['AlumniVerification'] || mongoose.model<IAlumniVerification>('AlumniVerification', AlumniVerificationSchema)) as any;
