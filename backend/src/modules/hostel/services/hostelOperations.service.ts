import mongoose from 'mongoose';
import QRCode from 'qrcode';
import HostelOutpass from '../models/HostelOutpass.model';
import HostelAttendance from '../models/HostelAttendance.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class HostelOperationsService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  // --- Attendance ---
  async markAttendance(records: {
    studentId: string;
    allocationId: string;
    hostelId: string;
    date: Date;
    rollCallType: 'MORNING' | 'EVENING' | 'NIGHT' | 'CUSTOM';
    status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | 'OUTPASS' | 'MEDICAL' | 'EXEMPTED';
    remarks?: string;
  }[], markedByUserId: string) {
    const ops = records.map(r => ({
      updateOne: {
        filter: { tenantId: this.tid, studentId: new mongoose.Types.ObjectId(r.studentId), date: r.date, rollCallType: r.rollCallType },
        update: { 
          $set: { 
            ...r, 
            tenantId: this.tid, 
            studentId: new mongoose.Types.ObjectId(r.studentId),
            allocationId: new mongoose.Types.ObjectId(r.allocationId),
            hostelId: new mongoose.Types.ObjectId(r.hostelId),
            markedByUserId: new mongoose.Types.ObjectId(markedByUserId), 
            markedAt: new Date() 
          } 
        },
        upsert: true,
      }
    }));
    return HostelAttendance.bulkWrite(ops);
  }

  async getAttendance(hostelId: string, date: Date) {
    return HostelAttendance.find({
      tenantId: this.tid,
      hostelId: new mongoose.Types.ObjectId(hostelId),
      date,
      isDeleted: { $ne: true },
    }).populate('studentId', 'firstName lastName');
  }

  // --- Outpass ---
  async requestOutpass(data: {
    studentId: string;
    hostelId: string;
    allocationId: string;
    leavingDateTime: Date;
    expectedReturnDateTime: Date;
    destination: string;
    reason: string;
    contactPerson?: string;
    contactNumber?: string;
  }) {
    const outpassId = new mongoose.Types.ObjectId();
    const qrCodeDataUri = await QRCode.toDataURL(outpassId.toString());
    
    return HostelOutpass.create({ 
      ...data, 
      _id: outpassId,
      tenantId: this.tid, 
      status: 'REQUESTED',
      qrCodeDataUri // Save the QR Code (make sure this field exists in the model)
    });
  }

  async approveOutpass(outpassId: string, approverUserId: string, role: 'PARENT' | 'WARDEN') {
    const outpass = await HostelOutpass.findOne({ _id: outpassId, tenantId: this.tid });
    if (!outpass) throw new NotFoundError('Outpass not found');

    if (role === 'PARENT') {
      if (outpass.status !== 'REQUESTED') throw new ValidationError('Outpass must be in REQUESTED state for parent approval');
      outpass.parentApprovedAt = new Date();
      outpass.parentApprovedByUserId = new mongoose.Types.ObjectId(approverUserId);
      outpass.status = 'PARENT_APPROVED';
    } else {
      if (!['REQUESTED', 'PARENT_APPROVED'].includes(outpass.status)) throw new ValidationError('Cannot warden-approve at this stage');
      outpass.wardenApprovedAt = new Date();
      outpass.wardenApprovedByUserId = new mongoose.Types.ObjectId(approverUserId);
      outpass.status = 'WARDEN_APPROVED';
    }
    await outpass.save();
    return outpass;
  }

  async recordReturn(outpassId: string, verifiedByUserId: string) {
    const outpass = await HostelOutpass.findOne({ _id: outpassId, tenantId: this.tid });
    if (!outpass) throw new NotFoundError('Outpass not found');
    if (!['ACTIVE', 'WARDEN_APPROVED', 'OVERDUE'].includes(outpass.status)) {
      throw new ValidationError('Cannot record return for outpass in current state');
    }
    const now = new Date();
    outpass.actualReturnDateTime = now;
    outpass.returnVerifiedByUserId = new mongoose.Types.ObjectId(verifiedByUserId);
    outpass.isLate = now > outpass.expectedReturnDateTime;
    outpass.status = 'RETURNED';
    await outpass.save();
    return outpass;
  }

  /**
   * Background job: detect and flag overdue outpasses
   */
  async detectOverdueOutpasses() {
    const now = new Date();
    const overdue = await HostelOutpass.find({
      tenantId: this.tid,
      status: { $in: ['ACTIVE', 'WARDEN_APPROVED'] },
      expectedReturnDateTime: { $lt: now },
      overdueAlertSent: false,
    });
    for (const op of overdue) {
      op.status = 'OVERDUE';
      op.overdueAlertSent = true;
      await op.save();
      console.log(`[HOSTEL] Outpass overdue for student ${op.studentId}`);
    }
    return overdue.length;
  }
}
