import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ICampus extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  facilities?: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

const CampusSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    address: String,
    contactEmail: String,
    contactPhone: String,
    facilities: [String],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

CampusSchema.index({ branchId: 1, code: 1 }, { unique: true });
CampusSchema.plugin(softDeletePlugin);

export default (mongoose.models['Campus'] || (mongoose.models['Campus'] || mongoose.model<ICampus>('Campus', CampusSchema)) as any) as any;
