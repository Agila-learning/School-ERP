import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentCareerProfile extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  careerObjective?: string;
  careerInterests: string[];
  preferredIndustries: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  higherEducationInterest: boolean;
  placementInterest: boolean;
  entrepreneurshipInterest: boolean;
  skills: string[];
  resumeUrl?: string;
  status: 'Active' | 'Inactive';
}

export interface ICareerGoal extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  goalType: 'Short-Term' | 'Long-Term';
  targetRole?: string;
  targetIndustry?: string;
  targetTimeline?: Date;
  status: 'Draft' | 'Active' | 'In Progress' | 'Achieved' | 'Deferred' | 'Cancelled';
}

export interface ICareerPlan extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  goalId: mongoose.Types.ObjectId;
  currentStatus: string;
  milestones: {
    title: string;
    completed: boolean;
    dueDate?: Date;
  }[];
}

const StudentCareerProfileSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true, unique: true },
  academicYearId: { type: Schema.Types.ObjectId, required: true },
  careerObjective: String,
  careerInterests: [String],
  preferredIndustries: [String],
  preferredRoles: [String],
  preferredLocations: [String],
  higherEducationInterest: { type: Boolean, default: false },
  placementInterest: { type: Boolean, default: true },
  entrepreneurshipInterest: { type: Boolean, default: false },
  skills: [String],
  resumeUrl: String,
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const CareerGoalSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  goalType: { type: String, required: true },
  targetRole: String,
  targetIndustry: String,
  targetTimeline: Date,
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const CareerPlanSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  goalId: { type: Schema.Types.ObjectId, ref: 'CareerGoal', required: true },
  currentStatus: String,
  milestones: [{
    title: String,
    completed: { type: Boolean, default: false },
    dueDate: Date
  }]
}, { timestamps: true });

[StudentCareerProfileSchema, CareerGoalSchema, CareerPlanSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const StudentCareerProfile = (mongoose.models['StudentCareerProfile'] || mongoose.model<IStudentCareerProfile>('StudentCareerProfile', StudentCareerProfileSchema)) as any;
export const CareerGoal = (mongoose.models['CareerGoal'] || mongoose.model<ICareerGoal>('CareerGoal', CareerGoalSchema)) as any;
export const CareerPlan = (mongoose.models['CareerPlan'] || mongoose.model<ICareerPlan>('CareerPlan', CareerPlanSchema)) as any;
