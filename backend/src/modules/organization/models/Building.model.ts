import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IBuilding extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  campusId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  floors: number;
  status: 'active' | 'inactive';
}

const BuildingSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    campusId: {
      type: Schema.Types.ObjectId,
      ref: 'Campus',
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
    floors: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

BuildingSchema.index({ campusId: 1, code: 1 }, { unique: true });
BuildingSchema.plugin(softDeletePlugin);

export default (mongoose.models['Building'] || (mongoose.models['Building'] || mongoose.model<IBuilding>('Building', BuildingSchema)) as any) as any;
