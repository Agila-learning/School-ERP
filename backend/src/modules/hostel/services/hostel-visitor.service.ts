import mongoose from 'mongoose';
import HostelVisitor from '../models/HostelVisitor.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class HostelVisitorService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getVisitors(hostelId?: string, status?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    if (status) q.status = status;
    return HostelVisitor.find(q)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('approvedByUserId', 'firstName lastName')
      .sort({ checkInDateTime: -1 });
  }

  async checkInVisitor(data: any) {
    return HostelVisitor.create({
      ...data,
      tenantId: this.tid,
      status: 'CHECKED_IN',
      checkInDateTime: data.checkInDateTime || new Date()
    });
  }

  async checkOutVisitor(id: string) {
    const visitor = await HostelVisitor.findOne({ _id: id, tenantId: this.tid });
    if (!visitor) throw new NotFoundError('Visitor not found');

    visitor.status = 'CHECKED_OUT';
    visitor.checkOutDateTime = new Date();
    await visitor.save();
    return visitor;
  }
}
