import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IBranch extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  principalId?: mongoose.Types.ObjectId;
  
  // Contact
  email?: string;
  phone?: string;
  
  // Address
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  
  // Academic Configuration
  workingHours?: {
    start: string;
    end: string;
  };
  
  status: 'ACTIVE' | 'INACTIVE';
}

const BranchSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    principalId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    email: String,
    phone: String,
    
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    
    workingHours: {
      start: String,
      end: String,
    },
    
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

BranchSchema.index({ tenantId: 1, code: 1 }, { unique: true });
BranchSchema.plugin(softDeletePlugin);

export default (mongoose.models['Branch'] || (mongoose.models['Branch'] || mongoose.model<IBranch>('Branch', BranchSchema)) as any) as any;
