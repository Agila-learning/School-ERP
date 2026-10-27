import mongoose, { Document, Schema } from 'mongoose';

export interface ISportsTeam extends Document {
  tenantId: any;
  branchId?: any;
  name: string;
  sportType: string;
  category: string; // e.g., 'Under-14', 'Under-17', 'Under-19', 'Senior Boys', 'Senior Girls'
  coachName?: string;
  coachId?: any;
  captainName?: string;
  captainId?: any;
  membersCount: number;
  achievements?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISBANDED';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SportsTeamSchema = new Schema<ISportsTeam>(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    branchId: { type: Schema.Types.Mixed, index: true },
    name: { type: String, required: true },
    sportType: { 
      type: String, 
      required: true,
      enum: ['FOOTBALL', 'CRICKET', 'BASKETBALL', 'BADMINTON', 'ATHLETICS', 'VOLLEYBALL', 'SWIMMING', 'CHESS', 'TABLE_TENNIS', 'TENNIS', 'OTHER']
    },
    category: { type: String, default: 'General' },
    coachName: { type: String },
    coachId: { type: Schema.Types.Mixed },
    captainName: { type: String },
    captainId: { type: Schema.Types.Mixed },
    membersCount: { type: Number, default: 0, min: 0 },
    achievements: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'DISBANDED'], default: 'ACTIVE' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

SportsTeamSchema.index({ tenantId: 1, sportType: 1, isDeleted: 1 });

export const SportsTeam = (mongoose.models.SportsTeam as mongoose.Model<ISportsTeam>) || mongoose.model<ISportsTeam>('SportsTeam', SportsTeamSchema);
