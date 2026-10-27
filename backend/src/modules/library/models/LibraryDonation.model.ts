import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILibraryDonation extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  donorName: string;
  donorContact?: string;
  donorEmail?: string;
  donorAddress?: string;
  donationDate: Date;
  books: {
    title: string;
    author?: string;
    isbn?: string;
    quantity: number;
    condition: 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';
  }[];
  totalBooks: number;
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'PARTIALLY_ACCEPTED' | 'REJECTED';
  notes?: string;
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  recordedBy: mongoose.Types.ObjectId;
}

const LibraryDonationSchema: Schema = new Schema({
  tenantId:      { type: Schema.Types.ObjectId, required: true, index: true },
  branchId:      { type: Schema.Types.ObjectId, index: true },
  libraryId:     { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  donorName:     { type: String, required: true },
  donorContact:  String,
  donorEmail:    String,
  donorAddress:  String,
  donationDate:  { type: Date, required: true, default: Date.now },
  books: [{
    title:     { type: String, required: true },
    author:    String,
    isbn:      String,
    quantity:  { type: Number, required: true, min: 1 },
    condition: { type: String, enum: ['NEW', 'GOOD', 'FAIR', 'DAMAGED'], default: 'GOOD' },
  }],
  totalBooks:     { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['RECEIVED', 'UNDER_REVIEW', 'ACCEPTED', 'PARTIALLY_ACCEPTED', 'REJECTED'],
    default: 'RECEIVED',
    index: true,
  },
  notes:          String,
  acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: Date,
  recordedBy:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

LibraryDonationSchema.index({ tenantId: 1, donationDate: -1 });
LibraryDonationSchema.plugin(softDeletePlugin);

const LibraryDonation = (mongoose.models['LibraryDonation'] || mongoose.model<ILibraryDonation>('LibraryDonation', LibraryDonationSchema)) as any;
export default LibraryDonation;
