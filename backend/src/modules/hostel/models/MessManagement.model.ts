import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

// --- MESS MEAL PLAN ---
export interface IMessMealPlan extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  date: Date;
  mealType: 'BREAKFAST' | 'LUNCH' | 'SNACKS' | 'DINNER' | 'SPECIAL';
  menu: string[];
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
}

const MessMealPlanSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
  date: { type: Date, default: Date.now },
  mealType: { type: String, enum: ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER', 'SPECIAL'], default: 'LUNCH' },
  menu: [{ type: String }],
  status: { type: String, enum: ['PLANNED', 'ACTIVE', 'COMPLETED'], default: 'PLANNED' }
}, { timestamps: true });
MessMealPlanSchema.plugin(softDeletePlugin);

// --- MESS FEEDBACK ---
export interface IMessFeedback extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  mealPlanId?: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comments?: string;
  category: 'FOOD_QUALITY' | 'TASTE' | 'CLEANLINESS' | 'MENU' | 'OTHER';
}

const MessFeedbackSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
  studentId: { type: Schema.Types.ObjectId, ref: 'User' },
  mealPlanId: { type: Schema.Types.ObjectId, ref: 'MessMealPlan' },
  rating: { type: Number, required: true, min: 1, max: 5, default: 4 },
  comments: String,
  category: { type: String, enum: ['FOOD_QUALITY', 'TASTE', 'CLEANLINESS', 'MENU', 'OTHER'], default: 'FOOD_QUALITY' }
}, { timestamps: true });
MessFeedbackSchema.plugin(softDeletePlugin);

export const MessMealPlan = (mongoose.models['MessMealPlan'] || mongoose.model<IMessMealPlan>('MessMealPlan', MessMealPlanSchema)) as any;
export const MessFeedback = (mongoose.models['MessFeedback'] || mongoose.model<IMessFeedback>('MessFeedback', MessFeedbackSchema)) as any;
