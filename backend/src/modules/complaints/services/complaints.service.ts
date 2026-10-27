import mongoose from 'mongoose';
import Complaint from '../models/Complaint.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class ComplaintService {
  constructor(private tid: string) {}

  async createComplaint(userId: string, data: any) {
    return Complaint.create({
      ...data,
      tenantId: this.tid,
      userId: new mongoose.Types.ObjectId(userId)
    });
  }

  async getComplaints(filter: any = {}) {
    return Complaint.find({ tenantId: this.tid, ...filter }).sort({ createdAt: -1 }).populate('userId', 'firstName lastName email').populate('assignedTo', 'firstName lastName');
  }

  async getComplaintById(id: string) {
    const c = await Complaint.findOne({ _id: id, tenantId: this.tid }).populate('userId', 'firstName lastName email').populate('assignedTo', 'firstName lastName');
    if (!c) throw new NotFoundError('Complaint not found');
    return c;
  }

  async updateComplaintStatus(id: string, status: string, resolution?: string, assignedTo?: string) {
    const updateData: any = { status };
    if (resolution) updateData.resolution = resolution;
    if (assignedTo) updateData.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    const c = await Complaint.findOneAndUpdate(
      { _id: id, tenantId: this.tid },
      { $set: updateData },
      { new: true }
    );
    if (!c) throw new NotFoundError('Complaint not found');
    return c;
  }
}
