import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export type TimetableDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' | 'DAY_1' | 'DAY_2' | 'DAY_3' | 'DAY_4' | 'DAY_5' | 'DAY_6';

export interface ITimetableEntry extends Document, ISoftDeleted {
  id: string;
  tenantId: mongoose.Types.ObjectId;
  versionId: mongoose.Types.ObjectId;
  academicYearId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  subjectId?: mongoose.Types.ObjectId;
  teacherEmployeeId?: mongoose.Types.ObjectId;  // References Employee (Phase 8)
  periodDefinitionId: mongoose.Types.ObjectId; // References PeriodDefinition (Phase 6)
  roomId?: mongoose.Types.ObjectId;            // References Room (Phase 5)
  day: TimetableDay;
  slotType: 'ACADEMIC' | 'LEISURE' | 'LIBRARY' | 'SPORTS' | 'BREAK' | 'ASSEMBLY' | 'REMEDIAL' | 'ACTIVITY';
  customTitle?: string;
  isDoublePeriod: boolean;
  doublePeriodPartnerEntryId?: mongoose.Types.ObjectId; // Links two consecutive entries
  status: 'ACTIVE' | 'CANCELLED' | 'SUBSTITUTED';
}

const TimetableEntrySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    versionId: { type: Schema.Types.ObjectId, ref: 'TimetableVersion', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: false },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: false },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: false },
    teacherEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: false, index: true },
    periodDefinitionId: { type: Schema.Types.ObjectId, ref: 'PeriodDefinition', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    day: { 
      type: String, 
      enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'DAY_1', 'DAY_2', 'DAY_3', 'DAY_4', 'DAY_5', 'DAY_6'], 
      required: true 
    },
    slotType: { 
      type: String, 
      enum: ['ACADEMIC', 'LEISURE', 'LIBRARY', 'SPORTS', 'BREAK', 'ASSEMBLY', 'REMEDIAL', 'ACTIVITY'], 
      default: 'ACADEMIC' 
    },
    customTitle: { type: String },
    isDoublePeriod: { type: Boolean, default: false },
    doublePeriodPartnerEntryId: { type: Schema.Types.ObjectId, ref: 'TimetableEntry' },
    status: { type: String, enum: ['ACTIVE', 'CANCELLED', 'SUBSTITUTED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

// Core conflict-prevention indexes
// A class/section cannot have two subjects in the same period on the same day (in same version)
TimetableEntrySchema.index(
  { tenantId: 1, versionId: 1, sectionId: 1, day: 1, periodDefinitionId: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' } }
);
// A teacher cannot be in two places at once (only when assigned)
TimetableEntrySchema.index(
  { tenantId: 1, versionId: 1, teacherEmployeeId: 1, day: 1, periodDefinitionId: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE', teacherEmployeeId: { $exists: true, $ne: null } } }
);
// A room cannot be double-booked
TimetableEntrySchema.index(
  { tenantId: 1, versionId: 1, roomId: 1, day: 1, periodDefinitionId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { status: 'ACTIVE', roomId: { $exists: true, $ne: null } } }
);

TimetableEntrySchema.plugin(softDeletePlugin);
export default (mongoose.models['TimetableEntry'] || (mongoose.models['TimetableEntry'] || mongoose.model<ITimetableEntry>('TimetableEntry', TimetableEntrySchema)) as any) as any;
