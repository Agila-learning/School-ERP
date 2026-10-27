import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IFamily extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  familyName: string;
  primaryContactId?: mongoose.Types.ObjectId; // A Parent
}

const FamilySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    familyName: { type: String, required: true },
    primaryContactId: { type: Schema.Types.ObjectId, ref: 'Parent' },
  },
  {
    timestamps: true,
  }
);

FamilySchema.plugin(softDeletePlugin);

export default (mongoose.models['Family'] || (mongoose.models['Family'] || mongoose.model<IFamily>('Family', FamilySchema)) as any) as any;
