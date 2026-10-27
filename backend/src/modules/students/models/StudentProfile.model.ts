import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentProfile extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Required: Ties login and cross-module identity
  familyId: mongoose.Types.ObjectId;
  
  // Demographics
  studentIdNumber: string; // The stable Student ID generated across all years (e.g. STU-001)
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  nationality: string;
  category?: string;
  religion?: string;
  motherTongue?: string;
  
  // References
  currentEnrollmentId?: mongoose.Types.ObjectId; // Shortcut to active enrollment
  photoUrl?: string;

  // Embedded Emergency Contacts to avoid excessive joins
  emergencyContacts: {
    name: string;
    relationship: string;
    mobile: string;
    priority: number;
  }[];

  // Sports
  sportsParticipation?: string[];
  sportsAchievements?: string[];
}

const StudentProfileSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: false, index: true },
    
    studentIdNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bloodGroup: String,
    nationality: { type: String, required: true },
    category: String,
    religion: String,
    motherTongue: String,
    
    currentEnrollmentId: { type: Schema.Types.ObjectId, ref: 'AcademicEnrollment' },
    photoUrl: String,

    emergencyContacts: [{
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      mobile: { type: String, required: true },
      priority: { type: Number, default: 1 },
    }],

    sportsParticipation: [{ type: String }],
    sportsAchievements: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

StudentProfileSchema.index({ tenantId: 1, studentIdNumber: 1 }, { unique: true });
StudentProfileSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentProfile'] || (mongoose.models['StudentProfile'] || mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema)) as any) as any;
