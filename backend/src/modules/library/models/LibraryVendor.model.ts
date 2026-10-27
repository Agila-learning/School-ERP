import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILibraryVendor extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  website?: string;
  specializations?: string[]; // e.g., 'Science Books', 'Fiction'
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
}

const LibraryVendorSchema = new Schema<ILibraryVendor>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  contactPerson: String,
  email: String,
  phone: String,
  address: String,
  gstNumber: String,
  panNumber: String,
  website: String,
  specializations: [String],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BLACKLISTED'],
    default: 'ACTIVE',
  },
  notes: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

LibraryVendorSchema.plugin(softDeletePlugin);

export default (mongoose.models['LibraryVendor'] || mongoose.model<ILibraryVendor>('LibraryVendor', LibraryVendorSchema)) as any;
