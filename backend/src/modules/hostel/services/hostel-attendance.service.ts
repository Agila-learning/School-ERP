import mongoose from 'mongoose';
import HostelAttendance from '../models/HostelAttendance.model';
import HostelAllocation from '../models/HostelAllocation.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class HostelAttendanceService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getAttendance(hostelId: string, date: string, rollCallType: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      q.date = { $gte: start, $lte: end };
    }
    if (rollCallType) q.rollCallType = rollCallType;

    return HostelAttendance.find(q)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('markedByUserId', 'firstName lastName');
  }

  async markAttendance(data: any, userId: string) {
    const { hostelId, records, date, rollCallType } = data;
    const dateObj = new Date(date);

    const ops = records.map((record: any) => ({
      updateOne: {
        filter: {
          tenantId: this.tid,
          studentId: new mongoose.Types.ObjectId(record.studentId),
          date: dateObj,
          rollCallType: rollCallType
        },
        update: {
          $set: {
            hostelId: new mongoose.Types.ObjectId(hostelId),
            allocationId: new mongoose.Types.ObjectId(record.allocationId),
            status: record.status,
            markedByUserId: new mongoose.Types.ObjectId(userId),
            markedAt: new Date(),
            remarks: record.remarks
          }
        },
        upsert: true
      }
    }));

    if (ops.length > 0) {
      await HostelAttendance.bulkWrite(ops);
    }
    return { success: true, count: ops.length };
  }

  async getActiveStudentsForAttendance(hostelId: string) {
    // Return all currently allocated students in this hostel
    return HostelAllocation.find({
      tenantId: this.tid,
      hostelId: new mongoose.Types.ObjectId(hostelId),
      status: { $in: ['ALLOCATED', 'CHECKED_IN'] },
      isDeleted: { $ne: true }
    })
    .populate('studentId', 'firstName lastName admissionNumber phone email')
    .populate('roomId bedId');
  }
}
