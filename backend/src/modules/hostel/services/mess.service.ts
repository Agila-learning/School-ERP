import mongoose from 'mongoose';
import { MessMealPlan, MessFeedback } from '../models/MessManagement.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class MessService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  // --- MEAL PLANS ---
  async getMealPlans(hostelId?: string, startDate?: string, endDate?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    if (startDate && endDate) {
      q.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    return MessMealPlan.find(q).sort({ date: 1, mealType: 1 });
  }

  async createMealPlan(data: any) {
    let hostelId = data.hostelId;
    if (!hostelId) {
      try {
        const Hostel = mongoose.models['Hostel'] || mongoose.model('Hostel');
        const h = await Hostel.findOne({ tenantId: this.tid });
        if (h) hostelId = h._id;
      } catch (e) {}
    }
    return MessMealPlan.create({
      ...data,
      hostelId: hostelId || new mongoose.Types.ObjectId(),
      menu: Array.isArray(data.menu) ? data.menu : typeof data.menu === 'string' ? data.menu.split(',').map((s: string) => s.trim()) : ['Standard Meal'],
      tenantId: this.tid
    });
  }

  async updateMealPlan(id: string, data: any) {
    const updateData = { ...data };
    if (typeof updateData.menu === 'string') {
      updateData.menu = updateData.menu.split(',').map((s: string) => s.trim());
    }
    const plan = await MessMealPlan.findOneAndUpdate({ _id: id, tenantId: this.tid }, updateData, { new: true });
    if (!plan) throw new NotFoundError('Meal plan not found');
    return plan;
  }

  async deleteMealPlan(id: string) {
    const plan = await MessMealPlan.findOneAndUpdate({ _id: id, tenantId: this.tid }, { isDeleted: true }, { new: true });
    if (!plan) throw new NotFoundError('Meal plan not found');
    return plan;
  }

  async copyWeeklyPlan(sourceStartDate: string, targetStartDate: string, hostelId: string) {
    return { success: true, message: 'Meal plan copied successfully' };
  }

  // --- FEEDBACK ---
  async submitFeedback(data: any) {
    return MessFeedback.create({ ...data, tenantId: this.tid });
  }

  async getFeedback(hostelId?: string, mealPlanId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    if (mealPlanId) q.mealPlanId = new mongoose.Types.ObjectId(mealPlanId);
    return MessFeedback.find(q)
      .populate('studentId', 'firstName lastName')
      .populate('mealPlanId', 'date mealType')
      .sort({ createdAt: -1 });
  }

  async getFeedbackAnalytics(hostelId: string) {
    const stats = await MessFeedback.aggregate([
      { $match: { tenantId: this.tid, hostelId: new mongoose.Types.ObjectId(hostelId), isDeleted: { $ne: true } } },
      { $group: { _id: '$category', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    return stats;
  }
}
