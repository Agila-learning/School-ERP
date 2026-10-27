import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IExamSeatingPlan extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId; // Ref ExamSchedule
  roomId: mongoose.Types.ObjectId; // Ref ExamRoom
  studentId: mongoose.Types.ObjectId; // Ref Student
  seatNumber: string;
  row?: number;
  column?: number;
}

const ExamSeatingPlanSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  examId: { type: Schema.Types.ObjectId, ref: 'ExaminationMaster', required: true, index: true },
  scheduleId: { type: Schema.Types.ObjectId, ref: 'ExamSchedule', required: true, index: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'ExamRoom', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  seatNumber: { type: String, required: true },
  row: Number,
  column: Number,
}, { timestamps: true });

// Prevent same student assigned twice to same schedule
ExamSeatingPlanSchema.index({ tenantId: 1, scheduleId: 1, studentId: 1 }, { unique: true });
// Prevent double booking of a seat in a room for a specific schedule
ExamSeatingPlanSchema.index({ tenantId: 1, scheduleId: 1, roomId: 1, seatNumber: 1 }, { unique: true });
ExamSeatingPlanSchema.plugin(softDeletePlugin);

export default (mongoose.models['ExamSeatingPlan'] || (mongoose.models['ExamSeatingPlan'] || mongoose.model<IExamSeatingPlan>('ExamSeatingPlan', ExamSeatingPlanSchema)) as any) as any;
