import mongoose, { Document, Schema } from 'mongoose';

export interface IPracticeSession extends Document {
  tenantId: any;
  branchId?: any;
  title: string;
  sportType: string;
  teamName?: string;
  teamId?: any;
  coachName: string;
  coachId?: any;
  venue: string; // e.g. 'Main Football Turf', 'Indoor Basketball Court', 'Cricket Nets A'
  sessionDate: Date;
  startTime: string; // e.g. '06:30 AM'
  endTime: string;   // e.g. '08:00 AM'
  drillsFocus?: string;
  attendanceCount: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PracticeSessionSchema = new Schema<IPracticeSession>(
  {
    tenantId: { type: Schema.Types.Mixed, required: true, index: true },
    branchId: { type: Schema.Types.Mixed, index: true },
    title: { type: String, required: true },
    sportType: { 
      type: String, 
      required: true,
      enum: ['FOOTBALL', 'CRICKET', 'BASKETBALL', 'BADMINTON', 'ATHLETICS', 'VOLLEYBALL', 'SWIMMING', 'CHESS', 'TABLE_TENNIS', 'OTHER']
    },
    teamName: { type: String },
    teamId: { type: Schema.Types.Mixed },
    coachName: { type: String, required: true },
    coachId: { type: Schema.Types.Mixed },
    venue: { type: String, required: true },
    sessionDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    drillsFocus: { type: String },
    attendanceCount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], 
      default: 'SCHEDULED' 
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

PracticeSessionSchema.index({ tenantId: 1, sessionDate: 1, isDeleted: 1 });

export const PracticeSession = (mongoose.models.PracticeSession as mongoose.Model<IPracticeSession>) || mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema);
