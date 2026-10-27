import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IOfferLetter extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  requisitionId: mongoose.Types.ObjectId;
  offerNumber: string;
  designationId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  proposedJoiningDate: Date;
  salaryPackageAnnual: number;
  employmentType: string;
  probationDurationMonths?: number;
  noticePeriodDays: number;
  expiryDate: Date;
  status: 'DRAFT' | 'APPROVED' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'WITHDRAWN';
}

const OfferLetterSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
  requisitionId: { type: Schema.Types.ObjectId, ref: 'JobRequisition', required: true },
  offerNumber: { type: String, required: true },
  designationId: { type: Schema.Types.ObjectId, ref: 'Designation', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  proposedJoiningDate: { type: Date, required: true },
  salaryPackageAnnual: { type: Number, required: true },
  employmentType: { type: String, required: true },
  probationDurationMonths: Number,
  noticePeriodDays: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN'],
    default: 'DRAFT',
  },
}, { timestamps: true });

OfferLetterSchema.index({ tenantId: 1, offerNumber: 1 }, { unique: true });
OfferLetterSchema.plugin(softDeletePlugin);

export default (mongoose.models['OfferLetter'] || (mongoose.models['OfferLetter'] || mongoose.model<IOfferLetter>('OfferLetter', OfferLetterSchema)) as any) as any;
