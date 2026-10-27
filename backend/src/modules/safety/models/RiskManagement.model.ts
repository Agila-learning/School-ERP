import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IRiskRegister extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  riskName: string;
  locationId?: mongoose.Types.ObjectId;
  cause: string;
  potentialImpact: string;
  likelihood: 'Low' | 'Moderate' | 'High' | 'Critical';
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  riskScore?: string;
  existingControls: string;
  mitigationPlan: string;
  ownerId?: mongoose.Types.ObjectId;
  reviewDate?: Date;
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Closed';
}

export interface ISafetyHazard extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hazardId: string;
  locationDetails: string;
  category: 'Electrical' | 'Fire' | 'Slip/Fall' | 'Structural' | 'Chemical' | 'Biological' | 'Equipment' | 'Security' | 'Traffic' | 'Environmental' | 'Water' | 'Other';
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedByUserId: mongoose.Types.ObjectId;
  reportedDate: Date;
  photoUrl?: string;
  assignedToUserId?: mongoose.Types.ObjectId;
  status: 'Reported' | 'Under Investigation' | 'Action Required' | 'Resolved' | 'Closed';
}

export interface ISafetyInspection extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  type: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Ad Hoc';
  category: 'Fire Safety' | 'Electrical Safety' | 'Laboratory Safety' | 'Kitchen Safety' | 'Hostel Safety' | 'Playground Safety' | 'Building Safety' | 'Transport Safety' | 'Security' | 'General Campus';
  inspectorId: mongoose.Types.ObjectId;
  date: Date;
  locationDetails: string;
  findings: Array<{
    requirement: string;
    response: 'Pass' | 'Fail' | 'Not Applicable' | 'Needs Attention';
    remarks?: string;
  }>;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Requires Action';
  nextInspectionDate?: Date;
}

export interface ICorrectiveAction extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  actionNumber: string;
  sourceType: 'Hazard' | 'Inspection' | 'Incident' | 'Drill' | 'Audit' | 'Other';
  sourceId?: mongoose.Types.ObjectId; // ID of the Hazard/Inspection/etc.
  description: string;
  ownerId: mongoose.Types.ObjectId;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: Date;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Pending Verification' | 'Completed' | 'Overdue' | 'Cancelled';
  completionEvidence?: string;
  verifiedByUserId?: mongoose.Types.ObjectId;
  verificationDate?: Date;
}

const RiskRegisterSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  riskName: { type: String, required: true },
  locationId: Schema.Types.ObjectId,
  cause: { type: String, required: true },
  potentialImpact: { type: String, required: true },
  likelihood: { type: String, required: true },
  severity: { type: String, required: true },
  riskScore: String,
  existingControls: { type: String, required: true },
  mitigationPlan: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewDate: Date,
  status: { type: String, default: 'Open' },
}, { timestamps: true });

const SafetyHazardSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hazardId: { type: String, required: true, unique: true },
  locationDetails: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  riskLevel: { type: String, required: true },
  reportedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedDate: { type: Date, required: true },
  photoUrl: String,
  assignedToUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Reported' },
}, { timestamps: true });

const SafetyInspectionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  type: { type: String, required: true },
  category: { type: String, required: true },
  inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  locationDetails: { type: String, required: true },
  findings: [{
    requirement: String,
    response: { type: String, enum: ['Pass', 'Fail', 'Not Applicable', 'Needs Attention'] },
    remarks: String
  }],
  status: { type: String, default: 'Planned' },
  nextInspectionDate: Date,
}, { timestamps: true });

const CorrectiveActionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  actionNumber: { type: String, required: true, unique: true },
  sourceType: { type: String, required: true },
  sourceId: Schema.Types.ObjectId,
  description: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'Open' },
  completionEvidence: String,
  verifiedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  verificationDate: Date,
}, { timestamps: true });

[RiskRegisterSchema, SafetyHazardSchema, SafetyInspectionSchema, CorrectiveActionSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const RiskRegister = (mongoose.models['RiskRegister'] || mongoose.model<IRiskRegister>('RiskRegister', RiskRegisterSchema)) as any;
export const SafetyHazard = (mongoose.models['SafetyHazard'] || mongoose.model<ISafetyHazard>('SafetyHazard', SafetyHazardSchema)) as any;
export const SafetyInspection = (mongoose.models['SafetyInspection'] || mongoose.model<ISafetyInspection>('SafetyInspection', SafetyInspectionSchema)) as any;
export const CorrectiveAction = (mongoose.models['CorrectiveAction'] || mongoose.model<ICorrectiveAction>('CorrectiveAction', CorrectiveActionSchema)) as any;
