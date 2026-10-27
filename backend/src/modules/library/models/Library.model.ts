import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILibrary extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  type: 'MAIN' | 'CAMPUS' | 'DEPARTMENT' | 'DIGITAL' | 'RESEARCH' | 'REFERENCE' | 'OTHER';
  description?: string;
  address?: string;
  contactNumber?: string;
  librarianId?: mongoose.Types.ObjectId; // Ref User/Employee
  openingTime?: string;
  closingTime?: string;
  workingDays: number[]; // 0=Sun, 1=Mon, etc.
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
}

const LibrarySchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['MAIN', 'CAMPUS', 'DEPARTMENT', 'DIGITAL', 'RESEARCH', 'REFERENCE', 'OTHER'],
    required: true,
  },
  description: String,
  address: String,
  contactNumber: String,
  librarianId: { type: Schema.Types.ObjectId, ref: 'User' },
  openingTime: String,
  closingTime: String,
  workingDays: [{ type: Number, min: 0, max: 6 }],
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'], default: 'ACTIVE' },
}, { timestamps: true });

LibrarySchema.index({ tenantId: 1, branchId: 1, code: 1 }, { unique: true });
LibrarySchema.plugin(softDeletePlugin);
export default (mongoose.models['Library'] || (mongoose.models['Library'] || mongoose.model<ILibrary>('Library', LibrarySchema)) as any) as any;
