import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAlumniProfile extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniId: string;
  studentId: mongoose.Types.ObjectId;
  graduationRecordId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  graduationYear: number;
  currentCity?: string;
  currentCountry?: string;
  bio?: string;
  professionalLinks?: {
    linkedIn?: string;
    portfolio?: string;
    github?: string;
    website?: string;
  };
  verificationStatus: 'Pending' | 'Verified' | 'Rejected' | 'Needs Review' | 'Suspended';
  engagementStatus: 'Active' | 'Inactive';
  privacySettings: {
    profileVisibility: 'Public' | 'Alumni Only' | 'School Only' | 'Private';
    contactVisibility: 'Public' | 'Alumni Only' | 'School Only' | 'Private';
    careerVisibility: 'Public' | 'Alumni Only' | 'School Only' | 'Private';
    educationVisibility: 'Public' | 'Alumni Only' | 'School Only' | 'Private';
    locationVisibility: 'Public' | 'Alumni Only' | 'School Only' | 'Private';
    linksVisibility: 'Public' | 'Alumni Only' | 'School Only' | 'Private';
    mentorAvailability: boolean;
  };
}

export interface IAlumniBatch extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  batchName: string;
  graduationYear: number;
  program: string;
  startYear: number;
  endYear: number;
  alumniCount: number;
}

export interface IAlumniEducation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniProfileId: mongoose.Types.ObjectId;
  institution: string;
  degree: string;
  program: string;
  startYear: number;
  endYear?: number;
}

export interface IAlumniCareer extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniProfileId: mongoose.Types.ObjectId;
  company: string;
  jobTitle: string;
  industry: string;
  employmentType: string;
  startDate: Date;
  endDate?: Date;
  currentJob: boolean;
  location: string;
}

export interface IAlumniSkill extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniProfileId: mongoose.Types.ObjectId;
  skillName: string;
  category: 'Technical' | 'Professional' | 'Leadership' | 'Domain' | 'Other';
}

export interface IAlumniAchievement extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  alumniProfileId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'Award' | 'Certification' | 'Publication' | 'Recognition' | 'Other';
  date: Date;
}

const AlumniProfileSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniId: { type: String, required: true, unique: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  graduationRecordId: { type: Schema.Types.ObjectId, ref: 'GraduationRecord' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'AlumniBatch' },
  graduationYear: { type: Number, required: true },
  currentCity: String,
  currentCountry: String,
  bio: String,
  professionalLinks: {
    linkedIn: String,
    portfolio: String,
    github: String,
    website: String,
  },
  verificationStatus: { type: String, default: 'Pending' },
  engagementStatus: { type: String, default: 'Active' },
  privacySettings: {
    profileVisibility: { type: String, enum: ['Public', 'Alumni Only', 'School Only', 'Private'], default: 'Alumni Only' },
    contactVisibility: { type: String, enum: ['Public', 'Alumni Only', 'School Only', 'Private'], default: 'Private' },
    careerVisibility: { type: String, enum: ['Public', 'Alumni Only', 'School Only', 'Private'], default: 'Alumni Only' },
    educationVisibility: { type: String, enum: ['Public', 'Alumni Only', 'School Only', 'Private'], default: 'Alumni Only' },
    locationVisibility: { type: String, enum: ['Public', 'Alumni Only', 'School Only', 'Private'], default: 'Alumni Only' },
    linksVisibility: { type: String, enum: ['Public', 'Alumni Only', 'School Only', 'Private'], default: 'Alumni Only' },
    mentorAvailability: { type: Boolean, default: false },
  }
}, { timestamps: true });

const AlumniBatchSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  batchName: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  program: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
  alumniCount: { type: Number, default: 0 },
}, { timestamps: true });

const AlumniEducationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  program: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: Number,
}, { timestamps: true });

const AlumniCareerSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  company: { type: String, required: true },
  jobTitle: { type: String, required: true },
  industry: { type: String, required: true },
  employmentType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  currentJob: { type: Boolean, default: false },
  location: String,
}, { timestamps: true });

const AlumniSkillSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  skillName: { type: String, required: true },
  category: { type: String, required: true },
}, { timestamps: true });

const AlumniAchievementSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  alumniProfileId: { type: Schema.Types.ObjectId, ref: 'AlumniProfile', required: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

[AlumniProfileSchema, AlumniBatchSchema, AlumniEducationSchema, AlumniCareerSchema, AlumniSkillSchema, AlumniAchievementSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const AlumniProfile = (mongoose.models['AlumniProfile'] || mongoose.model<IAlumniProfile>('AlumniProfile', AlumniProfileSchema)) as any;
export const AlumniBatch = (mongoose.models['AlumniBatch'] || mongoose.model<IAlumniBatch>('AlumniBatch', AlumniBatchSchema)) as any;
export const AlumniEducation = (mongoose.models['AlumniEducation'] || mongoose.model<IAlumniEducation>('AlumniEducation', AlumniEducationSchema)) as any;
export const AlumniCareer = (mongoose.models['AlumniCareer'] || mongoose.model<IAlumniCareer>('AlumniCareer', AlumniCareerSchema)) as any;
export const AlumniSkill = (mongoose.models['AlumniSkill'] || mongoose.model<IAlumniSkill>('AlumniSkill', AlumniSkillSchema)) as any;
export const AlumniAchievement = (mongoose.models['AlumniAchievement'] || mongoose.model<IAlumniAchievement>('AlumniAchievement', AlumniAchievementSchema)) as any;
