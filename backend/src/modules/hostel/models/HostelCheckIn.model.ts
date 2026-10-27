import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IIssuedItem {
  itemName: string;
  quantity: number;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
  inventoryItemId?: mongoose.Types.ObjectId; // Link to Inventory module if available
}

export interface IHostelCheckIn extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  allocationId: mongoose.Types.ObjectId;
  checkInDateTime: Date;
  roomId: mongoose.Types.ObjectId;
  bedId: mongoose.Types.ObjectId;
  parentGuardianName?: string;
  staffId: mongoose.Types.ObjectId;     // Verified by
  documents: string[];                  // Uploaded doc URLs
  issuedItems: IIssuedItem[];
  conditionReport?: string;
  remarks?: string;
}

export interface IHostelCheckOut extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  allocationId: mongoose.Types.ObjectId;
  checkOutDateTime: Date;
  reason: string;
  roomId: mongoose.Types.ObjectId;
  bedId: mongoose.Types.ObjectId;
  returnedItems: IIssuedItem[];
  damages?: string;
  pendingDues: number;
  staffId: mongoose.Types.ObjectId;
  parentAcknowledged: boolean;
  remarks?: string;
}

const issuedItemSchema = new Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  condition: { type: String, enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED'], default: 'GOOD' },
  inventoryItemId: { type: Schema.Types.ObjectId },
}, { _id: false });

const CheckInSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  allocationId: { type: Schema.Types.ObjectId, ref: 'HostelAllocation', required: true, unique: true },
  checkInDateTime: { type: Date, required: true, default: Date.now },
  roomId: { type: Schema.Types.ObjectId, ref: 'HostelRoom', required: true },
  bedId: { type: Schema.Types.ObjectId, ref: 'HostelBed', required: true },
  parentGuardianName: String,
  staffId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  documents: [String],
  issuedItems: [issuedItemSchema],
  conditionReport: String,
  remarks: String,
}, { timestamps: true });

CheckInSchema.plugin(softDeletePlugin);

const CheckOutSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  allocationId: { type: Schema.Types.ObjectId, ref: 'HostelAllocation', required: true, unique: true },
  checkOutDateTime: { type: Date, required: true, default: Date.now },
  reason: { type: String, required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'HostelRoom', required: true },
  bedId: { type: Schema.Types.ObjectId, ref: 'HostelBed', required: true },
  returnedItems: [issuedItemSchema],
  damages: String,
  pendingDues: { type: Number, default: 0 },
  staffId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  parentAcknowledged: { type: Boolean, default: false },
  remarks: String,
}, { timestamps: true });

CheckOutSchema.plugin(softDeletePlugin);

export const HostelCheckIn = (mongoose.models['HostelCheckIn'] || mongoose.model<IHostelCheckIn>('HostelCheckIn', CheckInSchema)) as any;
export const HostelCheckOut = (mongoose.models['HostelCheckOut'] || mongoose.model<IHostelCheckOut>('HostelCheckOut', CheckOutSchema)) as any;
