import mongoose from 'mongoose';
import { SecurityPatrol, AccessEvent, LostFoundItem } from '../models/Security.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class SecurityOperationsService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  // --- PATROLS ---
  async getPatrols() {
    return await SecurityPatrol.find({ tenantId: this.tid, isDeleted: { $ne: true } }).populate('securityStaffId', 'firstName lastName');
  }

  async startPatrol(data: any, securityStaffId: string) {
    const patrolNumber = 'PTRL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return await SecurityPatrol.create({
      ...data,
      patrolNumber,
      securityStaffId: new mongoose.Types.ObjectId(securityStaffId),
      startTime: new Date(),
      status: 'In Progress',
      tenantId: this.tid
    });
  }

  // --- ACCESS EVENTS ---
  async getAccessEvents(filters: any = {}) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (filters.personType) q.personType = filters.personType;
    if (filters.status) q.status = filters.status;
    return await AccessEvent.find(q).sort({ timestamp: -1 }).limit(100);
  }

  async recordAccess(data: any) {
    return await AccessEvent.create({
      ...data,
      timestamp: new Date(),
      tenantId: this.tid
    });
  }

  // --- LOST & FOUND ---
  async getLostAndFound() {
    return await LostFoundItem.find({ tenantId: this.tid, isDeleted: { $ne: true } }).populate('reportedByUserId', 'firstName lastName');
  }

  async reportItem(data: any, reportedByUserId: string) {
    const itemId = 'LF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return await LostFoundItem.create({
      ...data,
      itemId,
      reportedByUserId: new mongoose.Types.ObjectId(reportedByUserId),
      dateReported: new Date(),
      tenantId: this.tid
    });
  }
}
