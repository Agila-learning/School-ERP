import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IVendor extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  vendorIdString: string; // VEND-0001
  legalName: string;
  displayName: string;
  vendorType: 'SUPPLIER' | 'SERVICE_PROVIDER' | 'CONTRACTOR' | 'MAINTENANCE' | 'TRANSPORT' | 'IT' | 'OTHER';
  categories: string[]; // e.g. 'Stationery', 'IT Equipment'
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED' | 'INACTIVE';
  verificationStatus: 'UNVERIFIED' | 'DOCUMENTS_SUBMITTED' | 'IN_REVIEW' | 'VERIFIED';
  
  // Contact Info
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Contacts
  contacts: Array<{
    name: string;
    role: string;
    email?: string;
    phone?: string;
    isPrimary: boolean;
  }>;
  
  // Tax Info
  taxInformation: {
    taxId: string;
    taxType: string;
    registered: boolean;
  };
  
  // Bank Info (Encrypted or Masked in output)
  bankInformation: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
    isVerified: boolean;
  };
  
  // Performance
  rating: number; // 0-5
  performanceMetrics?: {
    onTimeDeliveryPercent: number;
    defectRatePercent: number;
    priceCompetitivenessScore: number;
  };
}

const VendorSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  vendorIdString: { type: String, required: true, unique: true },
  legalName: { type: String, required: true },
  displayName: { type: String, required: true },
  vendorType: {
    type: String,
    enum: ['SUPPLIER', 'SERVICE_PROVIDER', 'CONTRACTOR', 'MAINTENANCE', 'TRANSPORT', 'IT', 'OTHER'],
    required: true,
  },
  categories: [{ type: String }],
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'INACTIVE'],
    default: 'PENDING',
  },
  verificationStatus: {
    type: String,
    enum: ['UNVERIFIED', 'DOCUMENTS_SUBMITTED', 'IN_REVIEW', 'VERIFIED'],
    default: 'UNVERIFIED',
  },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  contacts: [{
    name: { type: String, required: true },
    role: String,
    email: String,
    phone: String,
    isPrimary: { type: Boolean, default: false }
  }],
  taxInformation: {
    taxId: String,
    taxType: String,
    registered: { type: Boolean, default: false }
  },
  bankInformation: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    branchName: String,
    ifscCode: String,
    isVerified: { type: Boolean, default: false }
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  performanceMetrics: {
    onTimeDeliveryPercent: { type: Number, default: 100 },
    defectRatePercent: { type: Number, default: 0 },
    priceCompetitivenessScore: { type: Number, default: 100 },
  }
}, { timestamps: true });

VendorSchema.plugin(softDeletePlugin);

// Prevent duplicate vendor emails per tenant
VendorSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default (mongoose.models['Vendor'] || (mongoose.models['Vendor'] || mongoose.model<IVendor>('Vendor', VendorSchema)) as any) as any;
