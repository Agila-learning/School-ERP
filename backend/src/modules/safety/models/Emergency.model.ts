import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISafetyIncident extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  incidentNumber: string;
  date: Date;
  time: string;
  locationDetails: string;
  reportedByUserId: mongoose.Types.ObjectId;
  incidentType: 'Accident' | 'Injury' | 'Security' | 'Property Damage' | 'Bullying' | 'Harassment' | 'Unauthorized Access' | 'Missing Person' | 'Fire' | 'Hazard' | 'Equipment Failure' | 'Safety Violation' | 'Transport' | 'Hostel' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  personsInvolved?: mongoose.Types.ObjectId[];
  immediateAction?: string;
  status: 'Reported' | 'Acknowledged' | 'Under Investigation' | 'Action Required' | 'Resolved' | 'Closed' | 'Archived';
  evidenceUrl?: string;
  assignedInvestigatorId?: mongoose.Types.ObjectId;
}

export interface IEmergencyEvent extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  emergencyType: string;
  locationDetails: string;
  declaredByUserId: mongoose.Types.ObjectId;
  timeStarted: Date;
  incidentCommanderId?: mongoose.Types.ObjectId;
  activePlanId?: mongoose.Types.ObjectId;
  state: 'Declared' | 'Response Active' | 'Evacuation' | 'Shelter-in-Place' | 'External Assistance' | 'Under Control' | 'Resolved' | 'Recovery' | 'Closed';
  externalServicesContacted: boolean;
}

export interface IEvacuationEvent extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  emergencyEventId: mongoose.Types.ObjectId;
  locationDetails: string;
  startTime: Date;
  assemblyPointId?: mongoose.Types.ObjectId;
  coordinatorId: mongoose.Types.ObjectId;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface IAccountabilityRecord extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  evacuationEventId: mongoose.Types.ObjectId;
  personId: mongoose.Types.ObjectId;
  personType: 'Student' | 'Employee' | 'Visitor';
  status: 'Expected' | 'Accounted' | 'Missing' | 'Reconciled';
  recordedByUserId?: mongoose.Types.ObjectId;
  timestamp?: Date;
}

const SafetyIncidentSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  incidentNumber: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  locationDetails: { type: String, required: true },
  reportedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  incidentType: { type: String, required: true },
  severity: { type: String, required: true },
  description: { type: String, required: true },
  personsInvolved: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  immediateAction: String,
  status: { type: String, default: 'Reported' },
  evidenceUrl: String,
  assignedInvestigatorId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const EmergencyEventSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  emergencyType: { type: String, required: true },
  locationDetails: { type: String, required: true },
  declaredByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timeStarted: { type: Date, required: true },
  incidentCommanderId: { type: Schema.Types.ObjectId, ref: 'User' },
  activePlanId: { type: Schema.Types.ObjectId, ref: 'EmergencyPlan' },
  state: { type: String, default: 'Declared' },
  externalServicesContacted: { type: Boolean, default: false },
}, { timestamps: true });

const EvacuationEventSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  emergencyEventId: { type: Schema.Types.ObjectId, ref: 'EmergencyEvent', required: true },
  locationDetails: { type: String, required: true },
  startTime: { type: Date, required: true },
  assemblyPointId: { type: Schema.Types.ObjectId, ref: 'AssemblyPoint' },
  coordinatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'Not Started' },
}, { timestamps: true });

const AccountabilityRecordSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  evacuationEventId: { type: Schema.Types.ObjectId, ref: 'EvacuationEvent', required: true },
  personId: { type: Schema.Types.ObjectId, required: true }, // Not heavily constrained by ref for flexibility across users/visitors
  personType: { type: String, enum: ['Student', 'Employee', 'Visitor'], required: true },
  status: { type: String, enum: ['Expected', 'Accounted', 'Missing', 'Reconciled'], default: 'Expected' },
  recordedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: Date,
}, { timestamps: true });

[SafetyIncidentSchema, EmergencyEventSchema, EvacuationEventSchema, AccountabilityRecordSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const SafetyIncident = (mongoose.models['SafetyIncident'] || mongoose.model<ISafetyIncident>('SafetyIncident', SafetyIncidentSchema)) as any;
export const EmergencyEvent = (mongoose.models['EmergencyEvent'] || mongoose.model<IEmergencyEvent>('EmergencyEvent', EmergencyEventSchema)) as any;
export const EvacuationEvent = (mongoose.models['EvacuationEvent'] || mongoose.model<IEvacuationEvent>('EvacuationEvent', EvacuationEventSchema)) as any;
export const AccountabilityRecord = (mongoose.models['AccountabilityRecord'] || mongoose.model<IAccountabilityRecord>('AccountabilityRecord', AccountabilityRecordSchema)) as any;
