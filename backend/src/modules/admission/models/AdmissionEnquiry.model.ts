import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAdmissionEnquiry extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  enquiryNumber: string;
  studentFirstName: string;
  studentLastName: string;
  parentName: string;
  mobile: string;
  email?: string;
  classId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  source: string; // Website, Walk-in, Referral, etc.
  referralDetails?: string;
  enquiryDate: Date;
  assignedCounsellorId?: mongoose.Types.ObjectId;
  status: 'OPEN' | 'FOLLOW_UP' | 'APPLICATION_SUBMITTED' | 'CLOSED' | 'LOST';
  nextFollowUpDate?: Date;
  notes?: string;
}

const AdmissionEnquirySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    enquiryNumber: { type: String, required: true },
    studentFirstName: { type: String, required: true },
    studentLastName: { type: String, required: true },
    parentName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: String,
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    source: { type: String, required: true, default: 'Walk-in' },
    referralDetails: String,
    enquiryDate: { type: Date, default: Date.now },
    assignedCounsellorId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['OPEN', 'FOLLOW_UP', 'APPLICATION_SUBMITTED', 'CLOSED', 'LOST'], 
      default: 'OPEN' 
    },
    nextFollowUpDate: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

AdmissionEnquirySchema.index({ tenantId: 1, enquiryNumber: 1 }, { unique: true });
AdmissionEnquirySchema.plugin(softDeletePlugin);

export default (mongoose.models['AdmissionEnquiry'] || (mongoose.models['AdmissionEnquiry'] || mongoose.model<IAdmissionEnquiry>('AdmissionEnquiry', AdmissionEnquirySchema)) as any) as any;
