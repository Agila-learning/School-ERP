import mongoose, { Document, Schema } from 'mongoose';

export interface ISportsEvent extends Document {
  tenantId: any;
  branchId?: any;
  title: string;
  sportType: string;
  eventType: 'INTER_SCHOOL' | 'INTRA_SCHOOL' | 'ANNUAL_SPORTS_DAY' | 'FRIENDLY' | 'DISTRICT_STATE';
  venue: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  participatingTeams?: string;
  coordinatorName?: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  results?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SportsEventSchema = new Schema<ISportsEvent>(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    branchId: { type: Schema.Types.Mixed, index: true },
    title: { type: String, required: true },
    sportType: { 
      type: String, 
      required: true,
      enum: ['FOOTBALL', 'CRICKET', 'BASKETBALL', 'BADMINTON', 'ATHLETICS', 'VOLLEYBALL', 'SWIMMING', 'CHESS', 'TABLE_TENNIS', 'TENNIS', 'MULTI_SPORT', 'OTHER']
    },
    eventType: { 
      type: String, 
      enum: ['INTER_SCHOOL', 'INTRA_SCHOOL', 'ANNUAL_SPORTS_DAY', 'FRIENDLY', 'DISTRICT_STATE'],
      default: 'INTER_SCHOOL'
    },
    venue: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String },
    participatingTeams: { type: String },
    coordinatorName: { type: String },
    status: { 
      type: String, 
      enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING' 
    },
    results: { type: String },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

SportsEventSchema.index({ tenantId: 1, startDate: 1, isDeleted: 1 });

export const SportsEvent = (mongoose.models.SportsEvent as mongoose.Model<ISportsEvent>) || mongoose.model<ISportsEvent>('SportsEvent', SportsEventSchema);
