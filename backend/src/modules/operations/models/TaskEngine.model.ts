import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ITask extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  module: string;
  entityType?: string;
  entityId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  assignedTeam?: mongoose.Types.ObjectId;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';
  status: 'Backlog' | 'Assigned' | 'In Progress' | 'Waiting' | 'Blocked' | 'Completed' | 'Cancelled' | 'Overdue' | 'Archived';
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  dependencies: mongoose.Types.ObjectId[];
  parentTaskId?: mongoose.Types.ObjectId;
  comments: {
    userId: mongoose.Types.ObjectId;
    text: string;
    isInternal: boolean;
    createdAt: Date;
  }[];
}

export interface ITaskTemplate extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  module: string;
  description?: string;
  defaultPriority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';
  estimatedDurationDays?: number;
}

const TaskSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true },
  description: String,
  module: { type: String, required: true },
  entityType: String,
  entityId: Schema.Types.ObjectId,
  createdBy: { type: Schema.Types.ObjectId, required: true },
  assignedTo: Schema.Types.ObjectId,
  assignedTeam: Schema.Types.ObjectId,
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'Assigned' },
  startDate: Date,
  dueDate: Date,
  completedDate: Date,
  dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  parentTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  comments: [{
    userId: { type: Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Prevent generic full table scans
TaskSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });
TaskSchema.index({ tenantId: 1, assignedTo: 1, status: 1 });

const TaskTemplateSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  module: { type: String, required: true },
  description: String,
  defaultPriority: { type: String, default: 'Medium' },
  estimatedDurationDays: Number,
}, { timestamps: true });

[TaskSchema, TaskTemplateSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const Task = (mongoose.models['Task'] || mongoose.model<ITask>('Task', TaskSchema)) as any;
export const TaskTemplate = (mongoose.models['TaskTemplate'] || mongoose.model<ITaskTemplate>('TaskTemplate', TaskTemplateSchema)) as any;
