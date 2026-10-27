import mongoose from 'mongoose';
import { PerformanceReview } from '../models/Performance.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class PerformanceService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async createReview(data: any) {
    const review = new PerformanceReview({
      tenantId: this.tid,
      ...data,
      status: 'GOALS_DRAFT'
    });
    return review.save();
  }

  async submitSelfReview(reviewId: string, selfRating: number) {
    const review = await PerformanceReview.findOneAndUpdate(
      { _id: reviewId, tenantId: this.tid },
      { 
        $set: { 
          overallSelfRating: selfRating,
          status: 'SELF_EVALUATION_SUBMITTED'
        } 
      },
      { new: true }
    );
    if (!review) throw new NotFoundError('Performance Review not found');
    return review;
  }

  async submitManagerReview(reviewId: string, managerComments: string, managerRating: number, managerId: string) {
    const review = await PerformanceReview.findOneAndUpdate(
      { _id: reviewId, tenantId: this.tid },
      { 
        $set: { 
          managerComments,
          overallManagerRating: managerRating,
          managerId: new mongoose.Types.ObjectId(managerId),
          status: 'MANAGER_EVALUATION_SUBMITTED'
        } 
      },
      { new: true }
    );
    if (!review) throw new NotFoundError('Performance Review not found');
    return review;
  }

  async getReviews(employeeId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (employeeId) filter.employeeId = new mongoose.Types.ObjectId(employeeId);
    return PerformanceReview.find(filter)
      .populate('employeeId', 'firstName lastName employeeIdNumber')
      .populate('managerId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }
}
