import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IOnlineClass extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  classId: mongoose.Types.ObjectId;
  sectionId?: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId; // Who is hosting
  platform: 'ZOOM' | 'MEET' | 'TEAMS' | 'OTHER';
  meetingLink: string;
  meetingPassword?: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

const OnlineClassSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['ZOOM', 'MEET', 'TEAMS', 'OTHER'], default: 'MEET' },
  meetingLink: { type: String, required: true },
  meetingPassword: { type: String },
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  status: { type: String, enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' }
}, { timestamps: true });

OnlineClassSchema.plugin(softDeletePlugin);

export default (mongoose.models['OnlineClass'] || mongoose.model<IOnlineClass>('OnlineClass', OnlineClassSchema)) as any;
