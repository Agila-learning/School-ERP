import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type ConflictType =
  | 'TEACHER_DOUBLE_BOOKING'
  | 'ROOM_DOUBLE_BOOKING'
  | 'CLASS_DOUBLE_BOOKING'
  | 'CAPACITY_EXCEEDED'
  | 'SUBJECT_SHORTFALL'
  | 'TEACHER_UNAVAILABLE'
  | 'ROOM_UNAVAILABLE'
  | 'CONSECUTIVE_LIMIT_EXCEEDED';

export type ConflictSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ITimetableConflict extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  versionId: mongoose.Types.ObjectId;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  description: string;
  relatedEntryIds: mongoose.Types.ObjectId[];
  isResolved: boolean;
  resolvedByUserId?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
}

const TimetableConflictSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    versionId: { type: Schema.Types.ObjectId, ref: 'TimetableVersion', required: true, index: true },
    conflictType: {
      type: String,
      enum: ['TEACHER_DOUBLE_BOOKING', 'ROOM_DOUBLE_BOOKING', 'CLASS_DOUBLE_BOOKING', 'CAPACITY_EXCEEDED', 'SUBJECT_SHORTFALL', 'TEACHER_UNAVAILABLE', 'ROOM_UNAVAILABLE', 'CONSECUTIVE_LIMIT_EXCEEDED'],
      required: true,
    },
    severity: { type: String, enum: ['ERROR', 'WARNING', 'INFO'], required: true },
    description: { type: String, required: true },
    relatedEntryIds: [{ type: Schema.Types.ObjectId, ref: 'TimetableEntry' }],
    isResolved: { type: Boolean, default: false },
    resolvedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true }
);

TimetableConflictSchema.index({ tenantId: 1, versionId: 1, isResolved: 1, severity: 1 });
TimetableConflictSchema.plugin(softDeletePlugin);
export default (mongoose.models['TimetableConflict'] || (mongoose.models['TimetableConflict'] || mongoose.model<ITimetableConflict>('TimetableConflict', TimetableConflictSchema)) as any) as any;
