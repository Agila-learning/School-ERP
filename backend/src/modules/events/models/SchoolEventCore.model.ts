import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ISchoolEvent extends Document, ISoftDeleted {
  eventId: string; // E.g., EVT-2026-0001
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  title: string;
  category: string; // Event categories (Academic, Sports, etc)
  description?: string;
  organizerRole: 'Teacher' | 'Employee' | 'Department' | 'Club' | 'Alumni' | 'Administration';
  organizerId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  venueType: 'Internal' | 'External' | 'Online';
  venueName: string;
  capacity?: number;
  visibilityRules: {
    target: 'Entire School' | 'Branch' | 'Grade' | 'Class' | 'Section' | 'Specific Group';
    targetIds?: mongoose.Types.ObjectId[];
  };
  requirements: {
    registrationRequired: boolean;
    permissionRequired: boolean;
    paymentRequired: boolean;
    paymentAmount?: number;
  };
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Registration Open' | 'Registration Closed' | 'Ongoing' | 'Completed' | 'Cancelled' | 'Postponed' | 'Archived';
}

export interface IEventVenueBooking extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  venueId: mongoose.Types.ObjectId;
  bookingStart: Date;
  bookingEnd: Date;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

const SchoolEventSchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  tenantId: { type: Schema.Types.Mixed, required: true, index: true },
  branchId: { type: Schema.Types.Mixed },
  academicYearId: { type: Schema.Types.Mixed },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  organizerRole: { type: String, required: true },
  organizerId: { type: Schema.Types.Mixed },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: String,
  endTime: String,
  venueType: { type: String, default: 'Internal' },
  venueName: { type: String, required: true },
  capacity: Number,
  visibilityRules: {
    target: { type: String, default: 'Entire School' },
    targetIds: [{ type: Schema.Types.ObjectId }]
  },
  requirements: {
    registrationRequired: { type: Boolean, default: false },
    permissionRequired: { type: Boolean, default: false },
    paymentRequired: { type: Boolean, default: false },
    paymentAmount: Number,
  },
  status: { type: String, default: 'Draft' },
}, { timestamps: true });

const EventVenueBookingSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'SchoolEvent', required: true },
  venueId: { type: Schema.Types.ObjectId, required: true },
  bookingStart: { type: Date, required: true },
  bookingEnd: { type: Date, required: true },
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

[SchoolEventSchema, EventVenueBookingSchema].forEach(schema => schema.plugin(softDeletePlugin));

export const SchoolEvent = (mongoose.models['SchoolEvent'] || mongoose.model<ISchoolEvent>('SchoolEvent', SchoolEventSchema)) as any;
export const EventVenueBooking = (mongoose.models['EventVenueBooking'] || mongoose.model<IEventVenueBooking>('EventVenueBooking', EventVenueBookingSchema)) as any;
