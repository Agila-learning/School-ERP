import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IEventTask extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  taskTitle: string;
  assignedTo: mongoose.Types.ObjectId; // User ID
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: Date;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  remarks?: string;
}

export interface IEventCommittee extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId; // User ID
  role: 'Coordinator' | 'Teacher' | 'Volunteer' | 'Security' | 'Finance' | 'Medical' | 'Other';
  responsibilities?: string;
}

export interface IEventBudget extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  estimatedRevenue: number;
  estimatedExpense: number;
  approvedBudget: number;
  actualExpense: number;
}

export interface IEventExpense extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  category: string;
  vendorId?: mongoose.Types.ObjectId;
  amount: number;
  approvedBy?: mongoose.Types.ObjectId; // User ID
  receiptUrl?: string;
}

const EventTaskSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  taskTitle: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, required: true },
  priority: { type: String, default: 'Medium' },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'Pending' },
  remarks: String,
}, { timestamps: true });

const EventCommitteeSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  memberId: { type: Schema.Types.ObjectId, required: true },
  role: { type: String, required: true },
  responsibilities: String,
}, { timestamps: true });

const EventBudgetSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  estimatedRevenue: { type: Number, default: 0 },
  estimatedExpense: { type: Number, default: 0 },
  approvedBudget: { type: Number, default: 0 },
  actualExpense: { type: Number, default: 0 },
}, { timestamps: true });

const EventExpenseSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  category: { type: String, required: true },
  vendorId: { type: Schema.Types.ObjectId },
  amount: { type: Number, required: true },
  approvedBy: { type: Schema.Types.ObjectId },
  receiptUrl: String,
}, { timestamps: true });

[EventTaskSchema, EventCommitteeSchema, EventBudgetSchema, EventExpenseSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const EventTask = (mongoose.models['EventTask'] || mongoose.model<IEventTask>('EventTask', EventTaskSchema)) as any;
export const EventCommittee = (mongoose.models['EventCommittee'] || mongoose.model<IEventCommittee>('EventCommittee', EventCommitteeSchema)) as any;
export const EventBudget = (mongoose.models['EventBudget'] || mongoose.model<IEventBudget>('EventBudget', EventBudgetSchema)) as any;
export const EventExpense = (mongoose.models['EventExpense'] || mongoose.model<IEventExpense>('EventExpense', EventExpenseSchema)) as any;
