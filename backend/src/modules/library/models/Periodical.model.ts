import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPeriodical extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  title: string;
  type: 'MAGAZINE' | 'JOURNAL' | 'NEWSPAPER' | 'PERIODICAL';
  publisherId?: mongoose.Types.ObjectId;
  frequency: 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL';
  issn?: string;
  language: string;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface IPeriodicalIssue extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  periodicalId: mongoose.Types.ObjectId;
  issueNumber: string;
  volumeNumber?: string;
  publicationDate: Date;
  receivedDate?: Date;
  status: 'EXPECTED' | 'RECEIVED' | 'MISSING' | 'DAMAGED';
}

const PeriodicalSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['MAGAZINE', 'JOURNAL', 'NEWSPAPER', 'PERIODICAL'],
    required: true,
  },
  publisherId: { type: Schema.Types.ObjectId, ref: 'Publisher' },
  frequency: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'],
    required: true,
  },
  issn: String,
  language: { type: String, required: true, default: 'English' },
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'], default: 'ACTIVE' },
}, { timestamps: true });
PeriodicalSchema.plugin(softDeletePlugin);

const PeriodicalIssueSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  periodicalId: { type: Schema.Types.ObjectId, ref: 'Periodical', required: true },
  issueNumber: { type: String, required: true },
  volumeNumber: String,
  publicationDate: { type: Date, required: true },
  receivedDate: Date,
  status: { type: String, enum: ['EXPECTED', 'RECEIVED', 'MISSING', 'DAMAGED'], default: 'EXPECTED' },
}, { timestamps: true });
PeriodicalIssueSchema.plugin(softDeletePlugin);

export const Periodical = (mongoose.models['Periodical'] || mongoose.model<IPeriodical>('Periodical', PeriodicalSchema)) as any;
export const PeriodicalIssue = (mongoose.models['PeriodicalIssue'] || mongoose.model<IPeriodicalIssue>('PeriodicalIssue', PeriodicalIssueSchema)) as any;
