import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISupplierDocument extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  
  documentType: 'REGISTRATION' | 'TAX_DOCUMENT' | 'CONTRACT' | 'CERTIFICATE' | 'BANK_DOCUMENT' | 'INSURANCE' | 'OTHER';
  documentName: string;
  fileUrl: string; // From document storage
  
  expiryDate?: Date;
  status: 'VALID' | 'EXPIRED' | 'REJECTED';
}

const SupplierDocumentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  
  documentType: {
    type: String,
    enum: ['REGISTRATION', 'TAX_DOCUMENT', 'CONTRACT', 'CERTIFICATE', 'BANK_DOCUMENT', 'INSURANCE', 'OTHER'],
    required: true
  },
  
  documentName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  
  expiryDate: Date,
  
  status: {
    type: String,
    enum: ['VALID', 'EXPIRED', 'REJECTED'],
    default: 'VALID'
  },
}, { timestamps: true });

SupplierDocumentSchema.plugin(softDeletePlugin);

export default (mongoose.models['SupplierDocument'] || mongoose.model<ISupplierDocument>('SupplierDocument', SupplierDocumentSchema)) as any;
