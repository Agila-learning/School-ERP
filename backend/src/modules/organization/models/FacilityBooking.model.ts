import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IFacilityBooking extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  
  purpose: string;
  expectedParticipants: number;
  
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  approvalId?: mongoose.Types.ObjectId;
  
  requiredFurniture?: string;
  requiredEquipment?: string;
  setupNotes?: string;
}

const FacilityBookingSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  
  purpose: { type: String, required: true },
  expectedParticipants: { type: Number, default: 0 },
  
  bookingDate: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  
  status: { type: String, default: 'PENDING' },
  approvalId: { type: Schema.Types.ObjectId, ref: 'ApprovalRequest' },
  
  requiredFurniture: String,
  requiredEquipment: String,
  setupNotes: String,
}, { timestamps: true });

// Prevent double booking at the index level or application level
FacilityBookingSchema.index({ tenantId: 1, roomId: 1, bookingDate: 1 });
FacilityBookingSchema.plugin(softDeletePlugin);

export const FacilityBooking = (mongoose.models['FacilityBooking'] || mongoose.model<IFacilityBooking>('FacilityBooking', FacilityBookingSchema)) as any;
