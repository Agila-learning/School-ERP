import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHolidayCalendar extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId; // Null means all branches
  name: string; // e.g., 'Diwali', 'Christmas'
  date: Date;
  type: 'PUBLIC' | 'ORGANIZATION' | 'RESTRICTED';
}

const HolidayCalendarSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['PUBLIC', 'ORGANIZATION', 'RESTRICTED'], required: true },
}, { timestamps: true });

HolidayCalendarSchema.index({ tenantId: 1, date: 1, branchId: 1 }, { unique: true });
HolidayCalendarSchema.plugin(softDeletePlugin);

export default (mongoose.models['HolidayCalendar'] || (mongoose.models['HolidayCalendar'] || mongoose.model<IHolidayCalendar>('HolidayCalendar', HolidayCalendarSchema)) as any) as any;
