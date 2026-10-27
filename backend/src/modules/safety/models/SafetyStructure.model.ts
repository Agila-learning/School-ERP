import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISafetyZone extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  zoneName: string;
  category: 'Academic' | 'Administrative' | 'Residential' | 'Laboratory' | 'Sports' | 'Parking' | 'Kitchen/Mess' | 'Utility' | 'Restricted' | 'Public';
  description?: string;
  buildings?: mongoose.Types.ObjectId[]; // Links to generic location/building structure
  status: 'Active' | 'Inactive';
}

export interface IEmergencyExit extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  exitNumber: string;
  locationDetails: string;
  buildingId?: mongoose.Types.ObjectId;
  zoneId?: mongoose.Types.ObjectId;
  capacity: number;
  accessibilityFeatures: string[];
  status: 'Operational' | 'Blocked' | 'Under Maintenance' | 'Restricted' | 'Closed';
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
}

export interface IAssemblyPoint extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  pointName: string;
  locationDetails: string;
  capacity: number;
  applicableBuildings?: mongoose.Types.ObjectId[];
  emergencyTypes: string[]; // e.g., ['Fire', 'Earthquake']
  status: 'Active' | 'Inactive';
}

export interface IEmergencyPlan extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  planName: string;
  emergencyType: string;
  applicableLocations?: mongoose.Types.ObjectId[];
  responsibleRoles: string[]; // Array of role titles or employee IDs
  evacuationProcedure: string;
  assemblyPointId?: mongoose.Types.ObjectId;
  communicationPlan: string;
  version: number;
  effectiveDate: Date;
  reviewDate?: Date;
  status: 'Draft' | 'Review' | 'Approved' | 'Active' | 'Superseded' | 'Archived';
}

const SafetyZoneSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  zoneName: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  buildings: [Schema.Types.ObjectId],
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const EmergencyExitSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  exitNumber: { type: String, required: true },
  locationDetails: { type: String, required: true },
  buildingId: Schema.Types.ObjectId,
  zoneId: { type: Schema.Types.ObjectId, ref: 'SafetyZone' },
  capacity: { type: Number, required: true },
  accessibilityFeatures: [String],
  status: { type: String, default: 'Operational' },
  lastInspectionDate: Date,
  nextInspectionDate: Date,
}, { timestamps: true });

const AssemblyPointSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  pointName: { type: String, required: true },
  locationDetails: { type: String, required: true },
  capacity: { type: Number, required: true },
  applicableBuildings: [Schema.Types.ObjectId],
  emergencyTypes: [String],
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const EmergencyPlanSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  planName: { type: String, required: true },
  emergencyType: { type: String, required: true },
  applicableLocations: [Schema.Types.ObjectId],
  responsibleRoles: [String],
  evacuationProcedure: { type: String, required: true },
  assemblyPointId: { type: Schema.Types.ObjectId, ref: 'AssemblyPoint' },
  communicationPlan: { type: String, required: true },
  version: { type: Number, default: 1 },
  effectiveDate: { type: Date, required: true },
  reviewDate: Date,
  status: { type: String, default: 'Draft' },
}, { timestamps: true });

[SafetyZoneSchema, EmergencyExitSchema, AssemblyPointSchema, EmergencyPlanSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const SafetyZone = (mongoose.models['SafetyZone'] || mongoose.model<ISafetyZone>('SafetyZone', SafetyZoneSchema)) as any;
export const EmergencyExit = (mongoose.models['EmergencyExit'] || mongoose.model<IEmergencyExit>('EmergencyExit', EmergencyExitSchema)) as any;
export const AssemblyPoint = (mongoose.models['AssemblyPoint'] || mongoose.model<IAssemblyPoint>('AssemblyPoint', AssemblyPointSchema)) as any;
export const EmergencyPlan = (mongoose.models['EmergencyPlan'] || mongoose.model<IEmergencyPlan>('EmergencyPlan', EmergencyPlanSchema)) as any;
