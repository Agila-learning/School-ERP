import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IPerformanceCycle extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g., 'Annual Appraisal 2026-27'
  startDate: Date;
  endDate: Date;
  status: 'DRAFT' | 'GOAL_SETTING' | 'MID_YEAR_REVIEW' | 'FINAL_EVALUATION' | 'CLOSED';
}

export interface IPerformanceReview extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  cycleId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  managerId: mongoose.Types.ObjectId;
  goals: {
    description: string;
    kpi: string;
    weightage: number; // percentage
    selfRating?: number; // 1-5
    managerRating?: number; // 1-5
  }[];
  overallSelfRating?: number;
  overallManagerRating?: number;
  managerComments?: string;
  hrComments?: string;
  status: 'GOALS_DRAFT' | 'GOALS_APPROVED' | 'SELF_EVALUATION_SUBMITTED' | 'MANAGER_EVALUATION_SUBMITTED' | 'HR_REVIEWED' | 'CLOSED';
}

const PerformanceCycleSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'GOAL_SETTING', 'MID_YEAR_REVIEW', 'FINAL_EVALUATION', 'CLOSED'],
    default: 'DRAFT',
  },
}, { timestamps: true });

const PerformanceReviewSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'PerformanceCycle', required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  goals: [{
    description: { type: String, required: true },
    kpi: { type: String, required: true },
    weightage: { type: Number, required: true },
    selfRating: Number,
    managerRating: Number,
  }],
  overallSelfRating: Number,
  overallManagerRating: Number,
  managerComments: String,
  hrComments: String,
  status: {
    type: String,
    enum: ['GOALS_DRAFT', 'GOALS_APPROVED', 'SELF_EVALUATION_SUBMITTED', 'MANAGER_EVALUATION_SUBMITTED', 'HR_REVIEWED', 'CLOSED'],
    default: 'GOALS_DRAFT',
  },
}, { timestamps: true });

PerformanceCycleSchema.plugin(softDeletePlugin);
PerformanceReviewSchema.index({ tenantId: 1, cycleId: 1, employeeId: 1 }, { unique: true });
PerformanceReviewSchema.plugin(softDeletePlugin);

export const PerformanceCycle = (mongoose.models['PerformanceCycle'] || mongoose.model<IPerformanceCycle>('PerformanceCycle', PerformanceCycleSchema)) as any;
export const PerformanceReview = (mongoose.models['PerformanceReview'] || mongoose.model<IPerformanceReview>('PerformanceReview', PerformanceReviewSchema)) as any;
