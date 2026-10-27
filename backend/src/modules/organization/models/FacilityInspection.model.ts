import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IFacilityInspection extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  facilityType: 'BUILDING' | 'ROOM' | 'CAMPUS';
  facilityId: mongoose.Types.ObjectId;
  inspectorId: mongoose.Types.ObjectId;
  
  inspectionDate: Date;
  inspectionType: 'ROUTINE' | 'SAFETY' | 'FIRE' | 'ELECTRICAL' | 'CLEANING';
  
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  issuesFound: string;
  recommendedActions?: string;
  
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'RESOLVED' | 'REQUIRES_WORK_ORDER';
  
  workOrderId?: mongoose.Types.ObjectId;
}

const FacilityInspectionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  facilityType: { type: String, required: true },
  facilityId: { type: Schema.Types.ObjectId, required: true },
  inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  inspectionDate: { type: Date, required: true, default: Date.now },
  inspectionType: { type: String, required: true },
  
  condition: { type: String, required: true },
  issuesFound: { type: String, required: true },
  recommendedActions: String,
  
  severity: { type: String, default: 'LOW' },
  status: { type: String, default: 'OPEN' },
  
  workOrderId: Schema.Types.ObjectId,
}, { timestamps: true });

FacilityInspectionSchema.plugin(softDeletePlugin);

export const FacilityInspection = (mongoose.models['FacilityInspection'] || mongoose.model<IFacilityInspection>('FacilityInspection', FacilityInspectionSchema)) as any;
