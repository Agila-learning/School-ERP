import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentAchievement extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  achievementTitle: string;
  category: string;
  description?: string;
  date: Date;
  level: 'School' | 'Inter-School' | 'District' | 'State' | 'National' | 'International';
  position?: string;
  organization?: string;
  evidenceUrl?: string;
  verificationStatus: 'Submitted' | 'Under Review' | 'Verified' | 'Rejected' | 'Needs Evidence';
  verifiedBy?: mongoose.Types.ObjectId;
}

export interface IStudentBadge extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  badgeName: string;
  description: string;
  iconUrl?: string;
  category: string;
}

export interface IBadgeAward extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  badgeId: mongoose.Types.ObjectId;
  awardedDate: Date;
  awardedBy: mongoose.Types.ObjectId;
  reason?: string;
}

export interface ICompetencyEvidence extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  activityId?: mongoose.Types.ObjectId; // E.g., Club ID or Event ID
  competency: string; // E.g., Leadership, Communication
  description: string;
  verified: boolean;
}

const StudentAchievementSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  achievementTitle: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  level: { type: String, required: true },
  position: String,
  organization: String,
  evidenceUrl: String,
  verificationStatus: { type: String, default: 'Submitted' },
  verifiedBy: { type: Schema.Types.ObjectId },
}, { timestamps: true });

const StudentBadgeSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  badgeName: { type: String, required: true },
  description: { type: String, required: true },
  iconUrl: String,
  category: { type: String, required: true },
}, { timestamps: true });

const BadgeAwardSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  badgeId: { type: Schema.Types.ObjectId, ref: 'StudentBadge', required: true },
  awardedDate: { type: Date, default: Date.now },
  awardedBy: { type: Schema.Types.ObjectId, required: true },
  reason: String,
}, { timestamps: true });

const CompetencyEvidenceSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  activityId: { type: Schema.Types.ObjectId },
  competency: { type: String, required: true },
  description: { type: String, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

[StudentAchievementSchema, StudentBadgeSchema, BadgeAwardSchema, CompetencyEvidenceSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const StudentAchievement = (mongoose.models['StudentAchievement'] || mongoose.model<IStudentAchievement>('StudentAchievement', StudentAchievementSchema)) as any;
export const StudentBadge = (mongoose.models['StudentBadge'] || mongoose.model<IStudentBadge>('StudentBadge', StudentBadgeSchema)) as any;
export const BadgeAward = (mongoose.models['BadgeAward'] || mongoose.model<IBadgeAward>('BadgeAward', BadgeAwardSchema)) as any;
export const CompetencyEvidence = (mongoose.models['CompetencyEvidence'] || mongoose.model<ICompetencyEvidence>('CompetencyEvidence', CompetencyEvidenceSchema)) as any;
