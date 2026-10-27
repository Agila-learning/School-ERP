import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type VehicleDocumentType = 'REGISTRATION' | 'INSURANCE' | 'FITNESS_CERTIFICATE' | 'PERMIT' | 'POLLUTION_CERTIFICATE' | 'OTHER';

export interface IVehicleDocument extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  documentType: VehicleDocumentType;
  documentNumber: string;
  provider?: string;
  issueDate: Date;
  expiryDate: Date;
  documentUrl?: string; // Reference to S3/Cloud Storage
  alertSent: boolean; // True if expiry alert was already sent
}

const VehicleDocumentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    documentType: {
      type: String,
      enum: ['REGISTRATION', 'INSURANCE', 'FITNESS_CERTIFICATE', 'PERMIT', 'POLLUTION_CERTIFICATE', 'OTHER'],
      required: true,
    },
    documentNumber: { type: String, required: true },
    provider: String,
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true, index: true }, // Index for fast expiry checks
    documentUrl: String,
    alertSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A vehicle typically has one active document of each type
VehicleDocumentSchema.index(
  { tenantId: 1, vehicleId: 1, documentType: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

VehicleDocumentSchema.plugin(softDeletePlugin);

export default (mongoose.models['VehicleDocument'] || (mongoose.models['VehicleDocument'] || mongoose.model<IVehicleDocument>('VehicleDocument', VehicleDocumentSchema)) as any) as any;
