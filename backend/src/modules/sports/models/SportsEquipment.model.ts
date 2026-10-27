import mongoose, { Document, Schema } from 'mongoose';

export interface ISportsEquipment extends Document {
  tenantId: any;
  branchId?: any;
  itemCode: string;
  name: string;
  sportCategory: string;
  quantity: number;
  availableQuantity: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED';
  location: string;
  status: 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'DISPOSED';
  lastInspectionDate?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SportsEquipmentSchema = new Schema<ISportsEquipment>(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    branchId: { type: Schema.Types.Mixed, index: true },
    itemCode: { type: String, required: true },
    name: { type: String, required: true },
    sportCategory: { 
      type: String, 
      required: true,
      enum: ['FOOTBALL', 'CRICKET', 'BASKETBALL', 'BADMINTON', 'ATHLETICS', 'VOLLEYBALL', 'SWIMMING', 'CHESS', 'TABLE_TENNIS', 'FITNESS', 'OTHER']
    },
    quantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    condition: { 
      type: String, 
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'], 
      default: 'GOOD' 
    },
    location: { type: String, default: 'Sports Room Storage' },
    status: { 
      type: String, 
      enum: ['AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'DISPOSED'], 
      default: 'AVAILABLE' 
    },
    lastInspectionDate: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

SportsEquipmentSchema.index({ tenantId: 1, sportCategory: 1, isDeleted: 1 });

export const SportsEquipment = (mongoose.models.SportsEquipment as mongoose.Model<ISportsEquipment>) || mongoose.model<ISportsEquipment>('SportsEquipment', SportsEquipmentSchema);
