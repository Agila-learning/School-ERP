import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILostFoundItem extends Document, ISoftDeleted {
  tenantId: any;
  itemNumber: string;
  title: string;
  description: string;
  category: 'BAG' | 'BOTTLE' | 'ELECTRONICS' | 'CLOTHING' | 'BOOKS_STATIONERY' | 'ID_CARD' | 'OTHER';
  dateFound: Date;
  locationFound: string;
  storageLocation: string;
  status: 'FOUND' | 'CLAIMED' | 'DISPOSED';
  foundBy?: string;
  claimedBy?: string;
  claimantContact?: string;
  claimedDate?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LostFoundItemSchema = new Schema<ILostFoundItem>(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    itemNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['BAG', 'BOTTLE', 'ELECTRONICS', 'CLOTHING', 'BOOKS_STATIONERY', 'ID_CARD', 'OTHER'],
      default: 'OTHER'
    },
    dateFound: { type: Date, default: Date.now },
    locationFound: { type: String, required: true },
    storageLocation: { type: String, default: 'Security Room — Main Office' },
    status: {
      type: String,
      enum: ['FOUND', 'CLAIMED', 'DISPOSED'],
      default: 'FOUND'
    },
    foundBy: { type: String },
    claimedBy: { type: String },
    claimantContact: { type: String },
    claimedDate: { type: Date },
    remarks: { type: String }
  },
  { timestamps: true }
);

LostFoundItemSchema.plugin(softDeletePlugin);

export const LostFoundItem = (mongoose.models.SecurityLostFoundItem as mongoose.Model<ILostFoundItem>) || mongoose.model<ILostFoundItem>('SecurityLostFoundItem', LostFoundItemSchema);
