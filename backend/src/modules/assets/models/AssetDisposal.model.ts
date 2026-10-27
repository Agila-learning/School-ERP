import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAssetDisposal extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
  
  disposalDate: Date;
  method: 'SALE' | 'RECYCLE' | 'DONATION' | 'SCRAP' | 'RETURN_TO_SUPPLIER' | 'OTHER';
  
  reason: string;
  conditionAtDisposal: 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED' | 'UNUSABLE';
  
  bookValueAtDisposal?: number;
  disposalValue?: number; // E.g., sale amount
  
  buyerOrRecipientName?: string;
  
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  
  status: 'REQUESTED' | 'APPROVED' | 'DISPOSED' | 'REJECTED';
  
  supportingDocumentId?: mongoose.Types.ObjectId;
}

const AssetDisposalSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  
  disposalDate: { type: Date, default: Date.now },
  method: {
    type: String,
    enum: ['SALE', 'RECYCLE', 'DONATION', 'SCRAP', 'RETURN_TO_SUPPLIER', 'OTHER'],
    required: true
  },
  
  reason: { type: String, required: true },
  conditionAtDisposal: {
    type: String,
    enum: ['GOOD', 'FAIR', 'POOR', 'DAMAGED', 'UNUSABLE'],
    required: true
  },
  
  bookValueAtDisposal: Number,
  disposalValue: Number,
  
  buyerOrRecipientName: String,
  
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  status: {
    type: String,
    enum: ['REQUESTED', 'APPROVED', 'DISPOSED', 'REJECTED'],
    default: 'REQUESTED'
  },
  
  supportingDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
}, { timestamps: true });

AssetDisposalSchema.plugin(softDeletePlugin);

export default (mongoose.models['AssetDisposal'] || mongoose.model<IAssetDisposal>('AssetDisposal', AssetDisposalSchema)) as any;
