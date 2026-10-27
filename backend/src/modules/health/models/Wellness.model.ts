import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IWellnessProgram extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  category: 'PHYSICAL_FITNESS' | 'NUTRITION' | 'MENTAL_WELLNESS' | 'HYGIENE' | 'SLEEP' | 'SUBSTANCE_PREVENTION' | 'DIGITAL_WELLNESS' | 'STRESS_MANAGEMENT' | 'OTHER';
  description: string;
  targetAudience: string[];
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
}

export interface IWellnessCampaign extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  programId: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  providerName?: string;
  targetGrades: string[];
  participantsCount?: number;
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  feedbackSummary?: string;
}

const WellnessProgramSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['PHYSICAL_FITNESS', 'NUTRITION', 'MENTAL_WELLNESS', 'HYGIENE', 'SLEEP', 'SUBSTANCE_PREVENTION', 'DIGITAL_WELLNESS', 'STRESS_MANAGEMENT', 'OTHER'], 
    required: true 
  },
  description: { type: String, required: true },
  targetAudience: [String],
  status: { type: String, enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'], default: 'ACTIVE' },
}, { timestamps: true });

const WellnessCampaignSchema = new Schema({
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  programId: { type: Schema.Types.Mixed, ref: 'WellnessProgram', required: false },
  name: { type: String, required: true },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date, required: true },
  providerName: String,
  targetGrades: [String],
  participantsCount: { type: Number, default: 0 },
  status: { type: String, enum: ['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'], default: 'PLANNED' },
  feedbackSummary: String,
}, { timestamps: true });

[WellnessProgramSchema, WellnessCampaignSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const WellnessProgram = (mongoose.models['WellnessProgram'] || mongoose.model<IWellnessProgram>('WellnessProgram', WellnessProgramSchema)) as any;
export const WellnessCampaign = (mongoose.models['WellnessCampaign'] || mongoose.model<IWellnessCampaign>('WellnessCampaign', WellnessCampaignSchema)) as any;

