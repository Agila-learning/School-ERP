import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISpecialClass extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  type: 'MASTERCLASS' | 'PRACTICAL' | 'WORKSHOP' | 'REMEDIAL' | 'ENRICHMENT' | 'REVISION';
  subject: string;
  targetGroup: string;
  teacher: string;
  venue: string;
  scheduledAt: Date;
  duration: number; // in minutes
  maxSeats: number;
  enrolled: number;
  objectives: string[];
  prerequisites?: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

const SpecialClassSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['MASTERCLASS', 'PRACTICAL', 'WORKSHOP', 'REMEDIAL', 'ENRICHMENT', 'REVISION'], required: true },
  subject: { type: String, required: true },
  targetGroup: { type: String, required: true },
  teacher: { type: String, required: true },
  venue: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  maxSeats: { type: Number, required: true },
  enrolled: { type: Number, default: 0 },
  objectives: [{ type: String }],
  prerequisites: { type: String },
  status: { type: String, enum: ['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'UPCOMING' }
}, { timestamps: true });

SpecialClassSchema.plugin(softDeletePlugin);

export default (mongoose.models['SpecialClass'] || mongoose.model<ISpecialClass>('SpecialClass', SpecialClassSchema)) as any;
