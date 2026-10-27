import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IStudentAddress extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  type: 'Current' | 'Permanent' | 'Previous';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isActive: boolean;
}

const StudentAddressSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true, index: true },
    type: { type: String, enum: ['Current', 'Permanent', 'Previous'], required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

StudentAddressSchema.plugin(softDeletePlugin);

export default (mongoose.models['StudentAddress'] || (mongoose.models['StudentAddress'] || mongoose.model<IStudentAddress>('StudentAddress', StudentAddressSchema)) as any) as any;
