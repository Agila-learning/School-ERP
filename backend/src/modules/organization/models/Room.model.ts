import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type RoomType = 'Classroom' | 'Laboratory' | 'Library' | 'Auditorium' | 'Playground' | 'Other';

export interface IRoom extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  buildingId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  type: RoomType;
  capacity: number;
  floor?: number;
  status: 'active' | 'inactive';
}

const RoomSchema: Schema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    buildingId: {
      type: Schema.Types.ObjectId,
      ref: 'Building',
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
    type: {
      type: String,
      enum: ['Classroom', 'Laboratory', 'Library', 'Auditorium', 'Playground', 'Other'],
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 30,
    },
    floor: {
      type: Number,
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

RoomSchema.index({ buildingId: 1, code: 1 }, { unique: true });
RoomSchema.plugin(softDeletePlugin);

export default (mongoose.models['Room'] || (mongoose.models['Room'] || mongoose.model<IRoom>('Room', RoomSchema)) as any) as any;
