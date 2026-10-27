import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IHostelMealPlan extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  date: Date;
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';
  menuItems: string[];
  isVegetarian: boolean;
  allergenInfo?: string;
  calorieInfo?: string;
  status: 'PLANNED' | 'ACTIVE' | 'SERVED' | 'CANCELLED';
  remarks?: string;
}

export interface IHostelMealAttendance extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  mealPlanId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  date: Date;
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER';
  status: 'ATTENDED' | 'NOT_ATTENDED' | 'ON_LEAVE' | 'EXEMPTED';
}

const MealPlanSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true, index: true },
  date: { type: Date, required: true },
  mealType: { type: String, enum: ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'], required: true },
  menuItems: [String],
  isVegetarian: { type: Boolean, default: false },
  allergenInfo: String,
  calorieInfo: String,
  status: { type: String, enum: ['PLANNED', 'ACTIVE', 'SERVED', 'CANCELLED'], default: 'PLANNED' },
  remarks: String,
}, { timestamps: true });

MealPlanSchema.index({ tenantId: 1, hostelId: 1, date: 1, mealType: 1 }, { unique: true });
MealPlanSchema.plugin(softDeletePlugin);

const MealAttendanceSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
  mealPlanId: { type: Schema.Types.ObjectId, ref: 'HostelMealPlan', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  mealType: { type: String, enum: ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'], required: true },
  status: { type: String, enum: ['ATTENDED', 'NOT_ATTENDED', 'ON_LEAVE', 'EXEMPTED'], required: true },
}, { timestamps: true });

MealAttendanceSchema.index({ tenantId: 1, studentId: 1, date: 1, mealType: 1 }, { unique: true });
MealAttendanceSchema.plugin(softDeletePlugin);

export const HostelMealPlan = (mongoose.models['HostelMealPlan'] || mongoose.model<IHostelMealPlan>('HostelMealPlan', MealPlanSchema)) as any;
export const HostelMealAttendance = (mongoose.models['HostelMealAttendance'] || mongoose.model<IHostelMealAttendance>('HostelMealAttendance', MealAttendanceSchema)) as any;
