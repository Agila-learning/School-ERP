import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISchool extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  legalName: string;
  displayName: string;
  code: string;
  registrationNumber?: string;
  affiliationNumber?: string;
  schoolType?: string; // Should reference MasterData in future
  board?: string; // Should reference MasterData
  medium?: string; // Should reference MasterData
  establishmentDate?: Date;
  
  // Branding
  logo?: string;
  favicon?: string;
  
  // Contact
  website?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  
  // Address
  address: {
    street?: string;
    area?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Configuration
  timezone: string;
  currency: string;
  dateFormat: string;
  
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'INACTIVE' | 'ARCHIVED';
}

const SchoolSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    legalName: { type: String, required: true },
    displayName: { type: String, required: true },
    code: { type: String, required: true },
    registrationNumber: String,
    affiliationNumber: String,
    schoolType: String,
    board: String,
    medium: String,
    establishmentDate: Date,
    
    logo: String,
    favicon: String,
    
    website: String,
    email: String,
    phone: String,
    alternatePhone: String,
    
    address: {
      street: String,
      area: String,
      city: String,
      district: String,
      state: String,
      country: String,
      postalCode: String,
      latitude: Number,
      longitude: Number,
    },
    
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    dateFormat: { type: String, default: 'YYYY-MM-DD' },
    
    status: {
      type: String,
      enum: ['ACTIVE', 'TRIAL', 'SUSPENDED', 'INACTIVE', 'ARCHIVED'],
      default: 'TRIAL',
    },
  },
  {
    timestamps: true,
  }
);

SchoolSchema.index({ tenantId: 1, code: 1 }, { unique: true });
SchoolSchema.plugin(softDeletePlugin);

export default (mongoose.models['School'] || (mongoose.models['School'] || mongoose.model<ISchool>('School', SchoolSchema)) as any) as any;
