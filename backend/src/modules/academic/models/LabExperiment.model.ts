import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILabExperiment extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  experimentNo: string;
  subject: string;
  chapter: string;
  class: string;
  teacher: string;
  labRoom: string;
  scheduledAt: Date;
  duration: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'GRADING';
  aim: string;
  apparatus: string[];
  chemicals: string[];
  safetyPrecautions: string[];
  procedure: string[];
  totalStudents: number;
  completedStudents: number;
  avgViva?: number;
}

const LabExperimentSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  title: { type: String, required: true },
  experimentNo: { type: String, required: true },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  class: { type: String, required: true },
  teacher: { type: String, required: true },
  labRoom: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'GRADING'], default: 'UPCOMING' },
  aim: { type: String, required: true },
  apparatus: [{ type: String }],
  chemicals: [{ type: String }],
  safetyPrecautions: [{ type: String }],
  procedure: [{ type: String }],
  totalStudents: { type: Number, required: true },
  completedStudents: { type: Number, default: 0 },
  avgViva: { type: Number }
}, { timestamps: true });

LabExperimentSchema.plugin(softDeletePlugin);

export default (mongoose.models['LabExperiment'] || mongoose.model<ILabExperiment>('LabExperiment', LabExperimentSchema)) as any;
