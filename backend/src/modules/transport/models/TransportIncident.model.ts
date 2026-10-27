import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type IncidentType = 'ACCIDENT' | 'MEDICAL_EMERGENCY' | 'VEHICLE_BREAKDOWN' | 'SECURITY_ISSUE' | 'STUDENT_INCIDENT' | 'ROUTE_OBSTRUCTION' | 'FIRE' | 'OTHER';

export interface ITransportIncident extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  tripId?: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  involvedStudentIds: mongoose.Types.ObjectId[];
  incidentDate: Date;
  latitude?: number;
  longitude?: number;
  incidentType: IncidentType;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionTaken?: string;
  attachmentUrls: string[];
  reportedByUserId: mongoose.Types.ObjectId;
  reviewedByUserId?: mongoose.Types.ObjectId;
  resolution?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
}

const TransportIncidentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    driverId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    involvedStudentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    incidentDate: { type: Date, required: true },
    latitude: Number,
    longitude: Number,
    incidentType: {
      type: String,
      enum: ['ACCIDENT', 'MEDICAL_EMERGENCY', 'VEHICLE_BREAKDOWN', 'SECURITY_ISSUE', 'STUDENT_INCIDENT', 'ROUTE_OBSTRUCTION', 'FIRE', 'OTHER'],
      required: true,
    },
    description: { type: String, required: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    actionTaken: String,
    attachmentUrls: [String],
    reportedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    resolution: String,
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
  },
  { timestamps: true }
);

TransportIncidentSchema.plugin(softDeletePlugin);

export default (mongoose.models['TransportIncident'] || (mongoose.models['TransportIncident'] || mongoose.model<ITransportIncident>('TransportIncident', TransportIncidentSchema)) as any) as any;
