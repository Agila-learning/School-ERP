import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IProcurementContract extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  contractNumber: string;
  vendorId: mongoose.Types.ObjectId;
  
  startDate: Date;
  endDate: Date;
  
  scopeOfWork: string;
  contractValue: number;
  
  renewalDate?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'RENEWED';
  
  documentId?: mongoose.Types.ObjectId;
  remarks?: string;
}

const ProcurementContractSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  contractNumber: { type: String, required: true, unique: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  scopeOfWork: { type: String, required: true },
  contractValue: { type: Number, required: true },
  
  renewalDate: Date,
  
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'RENEWED'],
    default: 'ACTIVE'
  },
  
  documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
  remarks: String,
}, { timestamps: true });

ProcurementContractSchema.plugin(softDeletePlugin);
ProcurementContractSchema.index({ tenantId: 1, contractNumber: 1 }, { unique: true });

export default (mongoose.models['ProcurementContract'] || mongoose.model<IProcurementContract>('ProcurementContract', ProcurementContractSchema)) as any;
