import mongoose from 'mongoose';
import { HostelLeaveRequest } from '../models/HostelLifecycle.model';
import HostelOutpass from '../models/HostelOutpass.model';
import HostelVisitor from '../models/HostelVisitor.model';
import { HostelComplaint } from '../models/HostelComplaint.model';
import HostelIncident from '../models/HostelIncident.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class HostelOperationsService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  // --- LEAVE MANAGEMENT ---
  async getLeaves(studentId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (studentId) q.studentId = new mongoose.Types.ObjectId(studentId);
    return HostelLeaveRequest.find(q).populate('studentId', 'firstName lastName studentId').sort({ startDate: -1 });
  }

  async submitLeaveRequest(data: any) {
    return HostelLeaveRequest.create({ ...data, tenantId: this.tid });
  }

  async processLeaveRequest(leaveId: string, status: 'APPROVED' | 'REJECTED', approvedBy: string) {
    const leave = await HostelLeaveRequest.findOne({ _id: leaveId, tenantId: this.tid });
    if (!leave) throw new NotFoundError('Leave request not found');
    leave.status = status;
    leave.approvedBy = new mongoose.Types.ObjectId(approvedBy);
    await leave.save();
    return leave;
  }

  // --- OUTPASS MANAGEMENT ---
  async getOutpasses(hostelId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    return HostelOutpass.find(q)
      .populate('studentId', 'firstName lastName studentId admissionNumber phone email')
      .populate('allocationId')
      .sort({ createdAt: -1 });
  }

  async createOutpass(data: any) {
    const studentId = data.studentId;
    let hostelId = data.hostelId;
    let allocationId = data.allocationId;

    if ((!hostelId || !allocationId) && studentId) {
      try {
        const HostelAllocation = mongoose.models['HostelAllocation'] || mongoose.model('HostelAllocation');
        const alloc = await HostelAllocation.findOne({ tenantId: this.tid, studentId, isDeleted: { $ne: true } });
        if (alloc) {
          allocationId = alloc._id;
          hostelId = alloc.hostelId;
        }
      } catch (e) {}
    }

    if (!hostelId) {
      try {
        const Hostel = mongoose.models['Hostel'] || mongoose.model('Hostel');
        const h = await Hostel.findOne({ tenantId: this.tid });
        if (h) hostelId = h._id;
      } catch (e) {}
    }

    return HostelOutpass.create({
      ...data,
      reason: data.reason || data.purpose || 'Personal Outpass',
      destination: data.destination || 'City',
      leavingDateTime: data.leavingDateTime || new Date(),
      expectedReturnDateTime: data.expectedReturnDateTime || new Date(Date.now() + 6 * 3600 * 1000),
      hostelId: hostelId || new mongoose.Types.ObjectId(),
      allocationId: allocationId || new mongoose.Types.ObjectId(),
      status: data.status || 'WARDEN_APPROVED',
      tenantId: this.tid
    });
  }

  async updateOutpassStatus(id: string, status: string) {
    const outpass = await HostelOutpass.findOneAndUpdate(
      { _id: id, tenantId: this.tid },
      { status },
      { new: true }
    );
    if (!outpass) throw new NotFoundError('Outpass not found');
    return outpass;
  }

  async processOutpassExit(outpassId: string) {
    const outpass = await HostelOutpass.findOne({ _id: outpassId, tenantId: this.tid });
    if (!outpass) throw new NotFoundError('Outpass not found');
    outpass.status = 'ACTIVE';
    outpass.actualLeavingTime = new Date();
    await outpass.save();
    return outpass;
  }

  async processOutpassReturn(outpassId: string) {
    const outpass = await HostelOutpass.findOne({ _id: outpassId, tenantId: this.tid });
    if (!outpass) throw new NotFoundError('Outpass not found');
    outpass.actualReturnTime = new Date();
    
    // Check if late
    if (outpass.expectedReturnTime && outpass.actualReturnTime > outpass.expectedReturnTime) {
      outpass.status = 'OVERDUE';
    } else {
      outpass.status = 'RETURNED';
    }
    await outpass.save();
    return outpass;
  }

  // --- VISITORS ---
  async getVisitors(hostelId?: string, date?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    if (date) {
      const start = new Date(date); start.setHours(0,0,0,0);
      const end = new Date(date); end.setHours(23,59,59,999);
      q.visitDate = { $gte: start, $lte: end };
    }
    return HostelVisitor.find(q).populate('studentId', 'firstName lastName studentId').sort({ entryTime: -1 });
  }

  async checkInVisitor(data: any) {
    return HostelVisitor.create({ ...data, tenantId: this.tid, entryTime: new Date(), status: 'CHECKED_IN' });
  }

  async checkOutVisitor(visitorId: string) {
    const visitor = await HostelVisitor.findOne({ _id: visitorId, tenantId: this.tid });
    if (!visitor) throw new NotFoundError('Visitor not found');
    visitor.status = 'CHECKED_OUT';
    visitor.exitTime = new Date();
    await visitor.save();
    return visitor;
  }

  // --- COMPLAINTS & INCIDENTS ---
  async getComplaints(hostelId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    return HostelComplaint.find(q).populate('reportedByStudentId', 'firstName lastName').sort({ createdAt: -1 });
  }

  async getIncidents(hostelId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    return HostelIncident.find(q).sort({ incidentDate: -1 });
  }
}
