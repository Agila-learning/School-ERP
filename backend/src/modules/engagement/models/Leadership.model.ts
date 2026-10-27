import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILeadershipPosition extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  positionName: string;
  level: 'School' | 'Branch' | 'House' | 'Club' | 'Class';
  eligibilityRules?: string;
  status: 'Active' | 'Inactive';
}

export interface IStudentElection extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  positionId: mongoose.Types.ObjectId;
  nominationStart: Date;
  nominationEnd: Date;
  votingStart: Date;
  votingEnd: Date;
  status: 'Draft' | 'Nomination Open' | 'Voting Open' | 'Result Published' | 'Completed';
}

export interface IElectionCandidate extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  electionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  manifesto?: string;
  photoUrl?: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

export interface IElectionVote extends Document {
  tenantId: mongoose.Types.ObjectId;
  electionId: mongoose.Types.ObjectId;
  voterId: mongoose.Types.ObjectId; // 1-vote-per-voter enforcement
  candidateId: mongoose.Types.ObjectId; 
  timestamp: Date;
  ipAddress?: string;
}

export interface IElectionResult extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  electionId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  totalVotes: number;
  rank: number;
  locked: boolean;
}

const LeadershipPositionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  positionName: { type: String, required: true },
  level: { type: String, required: true },
  eligibilityRules: String,
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const StudentElectionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, required: true },
  positionId: { type: Schema.Types.ObjectId, ref: 'LeadershipPosition', required: true },
  nominationStart: { type: Date, required: true },
  nominationEnd: { type: Date, required: true },
  votingStart: { type: Date, required: true },
  votingEnd: { type: Date, required: true },
  status: { type: String, default: 'Draft' },
}, { timestamps: true });

const ElectionCandidateSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'StudentElection', required: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  manifesto: String,
  photoUrl: String,
  approvalStatus: { type: String, default: 'Pending' },
}, { timestamps: true });

const ElectionVoteSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'StudentElection', required: true },
  voterId: { type: Schema.Types.ObjectId, required: true },
  candidateId: { type: Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
}, { timestamps: true });

// Prevent duplicate votes via database index
ElectionVoteSchema.index({ tenantId: 1, electionId: 1, voterId: 1 }, { unique: true });

const ElectionResultSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  electionId: { type: Schema.Types.ObjectId, ref: 'StudentElection', required: true },
  candidateId: { type: Schema.Types.ObjectId, required: true },
  totalVotes: { type: Number, required: true },
  rank: { type: Number, required: true },
  locked: { type: Boolean, default: false },
}, { timestamps: true });

[LeadershipPositionSchema, StudentElectionSchema, ElectionCandidateSchema, ElectionResultSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const LeadershipPosition = (mongoose.models['LeadershipPosition'] || mongoose.model<ILeadershipPosition>('LeadershipPosition', LeadershipPositionSchema)) as any;
export const StudentElection = (mongoose.models['StudentElection'] || mongoose.model<IStudentElection>('StudentElection', StudentElectionSchema)) as any;
export const ElectionCandidate = (mongoose.models['ElectionCandidate'] || mongoose.model<IElectionCandidate>('ElectionCandidate', ElectionCandidateSchema)) as any;
export const ElectionVote = (mongoose.models['ElectionVote'] || mongoose.model<IElectionVote>('ElectionVote', ElectionVoteSchema)) as any;
export const ElectionResult = (mongoose.models['ElectionResult'] || mongoose.model<IElectionResult>('ElectionResult', ElectionResultSchema)) as any;
