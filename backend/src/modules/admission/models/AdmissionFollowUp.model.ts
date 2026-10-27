import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAdmissionFollowUp extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  enquiryId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  followUpDate: Date;
  contactMethod: 'Phone' | 'Email' | 'WhatsApp' | 'SMS' | 'In-person';
  outcome: string;
  notes?: string;
  nextFollowUpDate?: Date;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
}

const AdmissionFollowUpSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    enquiryId: { type: Schema.Types.ObjectId, ref: 'AdmissionEnquiry' },
    applicationId: { type: Schema.Types.ObjectId, ref: 'AdmissionApplication' },
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followUpDate: { type: Date, required: true, default: Date.now },
    contactMethod: { 
      type: String, 
      enum: ['Phone', 'Email', 'WhatsApp', 'SMS', 'In-person'], 
      required: true 
    },
    outcome: { type: String, required: true },
    notes: String,
    nextFollowUpDate: Date,
    status: { 
      type: String, 
      enum: ['COMPLETED', 'PENDING', 'CANCELLED'], 
      default: 'COMPLETED' 
    },
  },
  {
    timestamps: true,
  }
);

AdmissionFollowUpSchema.plugin(softDeletePlugin);

export default (mongoose.models['AdmissionFollowUp'] || (mongoose.models['AdmissionFollowUp'] || mongoose.model<IAdmissionFollowUp>('AdmissionFollowUp', AdmissionFollowUpSchema)) as any) as any;
