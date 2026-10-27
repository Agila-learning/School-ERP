import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IApprovalWorkflow extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  module: string;
  conditions: any; // Dynamic JSON conditions
  steps: {
    stepOrder: number;
    approverRole?: string;
    approverId?: mongoose.Types.ObjectId;
    requireAll: boolean;
  }[];
  isActive: boolean;
}

export interface IApprovalRequest extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  workflowId: mongoose.Types.ObjectId;
  module: string;
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  reason?: string;
  currentStep: number;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Returned' | 'Cancelled' | 'Expired';
  history: {
    actionBy: mongoose.Types.ObjectId;
    actionType: 'Approve' | 'Reject' | 'Return' | 'Delegate' | 'Comment';
    comments?: string;
    actionDate: Date;
    step: number;
  }[];
}

const ApprovalWorkflowSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  module: { type: String, required: true },
  conditions: Schema.Types.Mixed,
  steps: [{
    stepOrder: Number,
    approverRole: String,
    approverId: Schema.Types.ObjectId,
    requireAll: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ApprovalRequestSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  workflowId: { type: Schema.Types.ObjectId, ref: 'ApprovalWorkflow', required: true },
  module: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  requestedBy: { type: Schema.Types.ObjectId, required: true },
  priority: { type: String, default: 'Medium' },
  reason: String,
  currentStep: { type: Number, default: 1 },
  status: { type: String, default: 'Pending' },
  history: [{
    actionBy: { type: Schema.Types.ObjectId, required: true },
    actionType: { type: String, required: true },
    comments: String,
    actionDate: { type: Date, default: Date.now },
    step: Number
  }]
}, { timestamps: true });

ApprovalRequestSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });

[ApprovalWorkflowSchema, ApprovalRequestSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const ApprovalWorkflow = (mongoose.models['ApprovalWorkflow'] || mongoose.model<IApprovalWorkflow>('ApprovalWorkflow', ApprovalWorkflowSchema)) as any;
export const ApprovalRequest = (mongoose.models['ApprovalRequest'] || mongoose.model<IApprovalRequest>('ApprovalRequest', ApprovalRequestSchema)) as any;
