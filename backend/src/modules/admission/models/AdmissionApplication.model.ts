import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAdmissionApplication extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  applicationNumber: string;
  branchId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  applyingClassId: mongoose.Types.ObjectId;
  
  // Embedded temporary student details (converted to StudentProfile upon admission)
  studentDetails: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    nationality: string;
    motherTongue?: string;
    category?: string;
    religion?: string;
    previousSchool?: string;
    previousClass?: string;
  };

  // Embedded temporary parent details
  parentDetails: {
    fatherName: string;
    fatherMobile: string;
    fatherEmail?: string;
    fatherOccupation?: string;
    motherName: string;
    motherMobile?: string;
    guardianName?: string;
  };

  // Embedded temporary address
  address: {
    current: string;
    permanent?: string;
  };

  applicationDate: Date;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'DOCUMENT_VERIFICATION' | 'INTERVIEW_SCHEDULED' | 'APPROVED' | 'WAITLISTED' | 'REJECTED' | 'ADMITTED';
  rejectionReason?: string;
  assignedCounsellorId?: mongoose.Types.ObjectId;
}

const AdmissionApplicationSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    applicationNumber: { type: String, required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    applyingClassId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    
    studentDetails: {
      firstName: { type: String, required: true },
      middleName: String,
      lastName: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
      bloodGroup: String,
      nationality: { type: String, required: true },
      motherTongue: String,
      category: String,
      religion: String,
      previousSchool: String,
      previousClass: String,
    },

    parentDetails: {
      fatherName: { type: String, required: true },
      fatherMobile: { type: String, required: true },
      fatherEmail: String,
      fatherOccupation: String,
      motherName: { type: String, required: true },
      motherMobile: String,
      guardianName: String,
    },

    address: {
      current: { type: String, required: true },
      permanent: String,
    },

    applicationDate: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION', 'INTERVIEW_SCHEDULED', 'APPROVED', 'WAITLISTED', 'REJECTED', 'ADMITTED'], 
      default: 'DRAFT' 
    },
    rejectionReason: String,
    assignedCounsellorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

AdmissionApplicationSchema.index({ tenantId: 1, applicationNumber: 1 }, { unique: true });
AdmissionApplicationSchema.plugin(softDeletePlugin);

export default (mongoose.models['AdmissionApplication'] || (mongoose.models['AdmissionApplication'] || mongoose.model<IAdmissionApplication>('AdmissionApplication', AdmissionApplicationSchema)) as any) as any;
