import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ICompetition extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId; // References SchoolEvent
  format: 'Individual' | 'Team';
  level: 'Inter-Class' | 'Inter-House' | 'Inter-School' | 'District' | 'State' | 'National';
  scoringMethod: 'Points' | 'Time' | 'Subjective Rubric';
}

export interface ICompetitionRound extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  roundName: string; // Qualifying, Semi-Final, Final
  sequence: number;
  status: 'Pending' | 'Active' | 'Completed' | 'Scored';
}

export interface IEventTeam extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  teamName: string;
  captainId: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  coachId?: mongoose.Types.ObjectId;
}

export interface IJudgingCriteria extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  criterionName: string;
  weight: number;
  maxScore: number;
}

export interface ICompetitionScore extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  roundId: mongoose.Types.ObjectId;
  participantId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  judgeId: mongoose.Types.ObjectId;
  criterionId?: mongoose.Types.ObjectId;
  score: number;
  remarks?: string;
  status: 'Draft' | 'Finalized' | 'Locked';
}

export interface ICompetitionResult extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  participantId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  totalScore: number;
  rank: number;
  award: 'Winner' | 'Runner Up' | 'Third Place' | 'Participation' | 'None';
}

const CompetitionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  format: { type: String, required: true },
  level: { type: String, required: true },
  scoringMethod: { type: String, required: true },
}, { timestamps: true });

const CompetitionRoundSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
  roundName: { type: String, required: true },
  sequence: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

const EventTeamSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
  teamName: { type: String, required: true },
  captainId: { type: Schema.Types.ObjectId, required: true },
  memberIds: [{ type: Schema.Types.ObjectId }],
  coachId: { type: Schema.Types.ObjectId },
}, { timestamps: true });

const JudgingCriteriaSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
  criterionName: { type: String, required: true },
  weight: { type: Number, default: 1 },
  maxScore: { type: Number, required: true },
}, { timestamps: true });

const CompetitionScoreSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  roundId: { type: Schema.Types.ObjectId, ref: 'CompetitionRound', required: true },
  participantId: { type: Schema.Types.ObjectId },
  teamId: { type: Schema.Types.ObjectId, ref: 'EventTeam' },
  judgeId: { type: Schema.Types.ObjectId, required: true },
  criterionId: { type: Schema.Types.ObjectId, ref: 'JudgingCriteria' },
  score: { type: Number, required: true },
  remarks: String,
  status: { type: String, default: 'Draft' },
}, { timestamps: true });

const CompetitionResultSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true },
  participantId: { type: Schema.Types.ObjectId },
  teamId: { type: Schema.Types.ObjectId, ref: 'EventTeam' },
  totalScore: { type: Number, required: true },
  rank: { type: Number, required: true },
  award: { type: String, default: 'None' },
}, { timestamps: true });

[CompetitionSchema, CompetitionRoundSchema, EventTeamSchema, JudgingCriteriaSchema, CompetitionScoreSchema, CompetitionResultSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const Competition = (mongoose.models['Competition'] || mongoose.model<ICompetition>('Competition', CompetitionSchema)) as any;
export const CompetitionRound = (mongoose.models['CompetitionRound'] || mongoose.model<ICompetitionRound>('CompetitionRound', CompetitionRoundSchema)) as any;
export const EventTeam = (mongoose.models['EventTeam'] || mongoose.model<IEventTeam>('EventTeam', EventTeamSchema)) as any;
export const JudgingCriteria = (mongoose.models['JudgingCriteria'] || mongoose.model<IJudgingCriteria>('JudgingCriteria', JudgingCriteriaSchema)) as any;
export const CompetitionScore = (mongoose.models['CompetitionScore'] || mongoose.model<ICompetitionScore>('CompetitionScore', CompetitionScoreSchema)) as any;
export const CompetitionResult = (mongoose.models['CompetitionResult'] || mongoose.model<ICompetitionResult>('CompetitionResult', CompetitionResultSchema)) as any;
