import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IParent extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // For portal login
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  relationship: 'Father' | 'Mother' | 'Guardian' | 'Grandparent' | 'Other';
  mobile: string;
  alternateMobile?: string;
  email?: string;
  address?: {
    currentAddress: string;
    permanentAddress?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  occupation?: string;
  employer?: string;
  isEmergencyContact: boolean;
  profilePhotoUrl?: string;
  preferredLanguage: string;
  communicationPreferences: ('Email' | 'SMS' | 'WhatsApp' | 'Push')[];
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'PENDING';
  accountStatus: 'INVITED' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'INACTIVE';
}

const ParentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    familyId: { type: Schema.Types.ObjectId, ref: 'Family', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    preferredName: String,
    relationship: { type: String, enum: ['Father', 'Mother', 'Guardian', 'Grandparent', 'Other'], required: true },
    mobile: { type: String, required: true },
    alternateMobile: String,
    email: String,
    address: {
      currentAddress: String,
      permanentAddress: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    occupation: String,
    employer: String,
    isEmergencyContact: { type: Boolean, default: false },
    profilePhotoUrl: String,
    preferredLanguage: { type: String, default: 'English' },
    communicationPreferences: [{ type: String, enum: ['Email', 'SMS', 'WhatsApp', 'Push'] }],
    verificationStatus: { type: String, enum: ['UNVERIFIED', 'VERIFIED', 'PENDING'], default: 'UNVERIFIED' },
    accountStatus: { 
      type: String, 
      enum: ['INVITED', 'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'LOCKED', 'INACTIVE'],
      default: 'INACTIVE'
    },
  },
  {
    timestamps: true,
  }
);

ParentSchema.plugin(softDeletePlugin);

export default (mongoose.models['Parent'] || mongoose.model<IParent>('Parent', ParentSchema)) as any;
