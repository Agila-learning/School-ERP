import mongoose from 'mongoose';
import HostelApplication from '../models/HostelApplication.model';
import HostelAllocation from '../models/HostelAllocation.model';
import { HostelBed, HostelRoom } from '../models/HostelRoom.model';
import { HostelWaitlist, HostelCheckOut, HostelTransfer } from '../models/HostelLifecycle.model';
import { HostelCheckIn } from '../models/HostelCheckIn.model';
import Hostel from '../models/Hostel.model';
import { FeeService } from '../../finance/services/fee.service';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';

export class HostelAllocationService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  // --- APPLICATION & WAITLIST ---
  async getApplications(hostelId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.preferredHostelId = new mongoose.Types.ObjectId(hostelId);
    return HostelApplication.find(q)
      .populate('studentId', 'firstName lastName admissionNumber email phone')
      .populate('preferredHostelId', 'name hostelType code');
  }

  async createApplication(data: any) {
    // Check if student already has an active allocation or pending application
    const existingApp = await HostelApplication.findOne({ 
      tenantId: this.tid, studentId: data.studentId, status: { $in: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'WAITLISTED'] } 
    });
    if (existingApp) throw new ValidationError('Student already has an active or pending hostel application');
    
    return HostelApplication.create({ ...data, tenantId: this.tid });
  }

  async processApplication(applicationId: string, action: 'APPROVE' | 'REJECT' | 'WAITLIST', payload?: any) {
    const app = await HostelApplication.findOne({ _id: applicationId, tenantId: this.tid });
    if (!app) throw new NotFoundError('Application not found');

    if (action === 'APPROVE') {
      app.status = 'APPROVED';
      // Ideally, we move to allocation step here
    } else if (action === 'REJECT') {
      app.status = 'REJECTED';
    } else if (action === 'WAITLIST') {
      app.status = 'WAITLISTED';
      await HostelWaitlist.create({
        tenantId: this.tid,
        academicYearId: app.academicYearId,
        applicationId: app._id,
        studentId: app.studentId,
        hostelId: app.preferredHostelId || payload.hostelId,
        position: await HostelWaitlist.countDocuments({ tenantId: this.tid, hostelId: app.preferredHostelId }) + 1
      });
    }
    await app.save();
    return app;
  }

  // --- ALLOCATION (Core Transaction) ---
  async getAllocations(hostelId?: string) {
    const q: any = { tenantId: this.tid, status: { $in: ['ALLOCATED', 'CHECKED_IN'] }, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    return HostelAllocation.find(q)
      .populate('studentId', 'firstName lastName admissionNumber email phone rollNumber')
      .populate('bedId roomId hostelId');
  }

  async allocateBed(studentId: string, bedId: string, academicYearId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const studentObjId = new mongoose.Types.ObjectId(studentId);
      const bedObjId = new mongoose.Types.ObjectId(bedId);

      // 1. Ensure student is not already allocated
      const existingAlloc = await HostelAllocation.findOne({ tenantId: this.tid, studentId: studentObjId, status: { $in: ['ALLOCATED', 'CHECKED_IN'] } }).session(session);
      if (existingAlloc) throw new ValidationError('Student is already allocated a bed.');

      // 2. Lock the bed and verify availability
      const bed = await HostelBed.findOne({ _id: bedObjId, tenantId: this.tid }).session(session);
      if (!bed) throw new NotFoundError('Bed not found');
      if (bed.status !== 'AVAILABLE') throw new ValidationError('Bed is not available');

      // 3. Create allocation
      const room = await HostelRoom.findOne({ _id: bed.roomId }).session(session);
      
      const allocation = await HostelAllocation.create([{
        tenantId: this.tid,
        studentId: studentObjId,
        academicYearId: new mongoose.Types.ObjectId(academicYearId),
        hostelId: room?.hostelId,
        roomId: bed.roomId,
        bedId: bed._id,
        allocationDate: new Date(),
        status: 'ALLOCATED'
      }], { session });

      // 4. Update Bed and Room
      bed.status = 'RESERVED';
      bed.currentAllocationId = allocation[0]._id;
      await bed.save({ session });
      
      if (room) {
        room.currentOccupancy = (room.currentOccupancy || 0) + 1;
        room.status = room.currentOccupancy >= room.capacity ? 'FULL' : 'PARTIALLY_OCCUPIED';
        await room.save({ session });
      }

      const hostel = await Hostel.findOne({ _id: room?.hostelId }).session(session);

      await session.commitTransaction();

      // Trigger Fee Generation outside the transaction (if it fails, we can handle it later or retry)
      if (hostel) {
        try {
          const feeSvc = new FeeService(this.tenantId);
          // Hardcoded dummy amount 5000 for now. In production, this would come from a HostelFee mapping or request body.
          const invoice = await feeSvc.generateHostelFeeInvoice(studentId, academicYearId, hostel.branchId.toString(), 5000, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
          
          allocation[0].feeDemandId = invoice._id; // Using feeDemandId field to store invoice reference
          await allocation[0].save();
        } catch (feeError) {
          console.error("Error generating hostel fee:", feeError);
        }
      }

      return allocation[0];
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // --- CHECK IN ---
  async checkInStudent(allocationId: string, processedBy: string, condition: string, remarks?: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const alloc = await HostelAllocation.findOne({ _id: allocationId, tenantId: this.tid }).session(session);
      if (!alloc) throw new NotFoundError('Allocation not found');
      if (alloc.status !== 'ALLOCATED') throw new ValidationError('Allocation must be in ALLOCATED state to check-in');

      alloc.status = 'CHECKED_IN';
      await alloc.save({ session });

      const checkIn = await HostelCheckIn.create([{
        tenantId: this.tid,
        allocationId: alloc._id,
        studentId: alloc.studentId,
        checkInDate: new Date(),
        processedBy: new mongoose.Types.ObjectId(processedBy),
        roomConditionAtCheckIn: condition,
        inventoryHandedOver: [],
        remarks
      }], { session });

      const bed = await HostelBed.findOne({ _id: alloc.bedId }).session(session);
      if (bed) {
        bed.status = 'OCCUPIED';
        await bed.save({ session });
      }

      await session.commitTransaction();
      return checkIn[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // --- TRANSFER ---
  async transferRoom(transferId: string, targetBedId: string, processedBy: string) {
    // Highly simplified: Release old bed, allocate new bed, update allocation
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const transfer = await HostelTransfer.findOne({ _id: transferId, tenantId: this.tid }).session(session);
      if (!transfer) throw new NotFoundError('Transfer request not found');

      const oldAlloc = await HostelAllocation.findOne({ _id: transfer.currentAllocationId }).session(session);
      if (!oldAlloc) throw new NotFoundError('Current allocation not found');

      const oldBed = await HostelBed.findOne({ _id: oldAlloc.bedId }).session(session);
      const newBed = await HostelBed.findOne({ _id: targetBedId }).session(session);

      if (!newBed || newBed.status !== 'AVAILABLE') throw new ValidationError('Target bed is not available');

      // Update old bed/room
      if (oldBed) {
        oldBed.status = 'AVAILABLE';
        oldBed.currentAllocationId = undefined;
        await oldBed.save({ session });
        const oldRoom = await HostelRoom.findOne({ _id: oldBed.roomId }).session(session);
        if (oldRoom) {
          oldRoom.currentOccupancy = Math.max(0, oldRoom.currentOccupancy - 1);
          oldRoom.status = oldRoom.currentOccupancy === 0 ? 'AVAILABLE' : 'PARTIALLY_OCCUPIED';
          await oldRoom.save({ session });
        }
      }

      // Update new bed/room
      newBed.status = 'OCCUPIED';
      newBed.currentAllocationId = oldAlloc._id;
      await newBed.save({ session });

      const newRoom = await HostelRoom.findOne({ _id: newBed.roomId }).session(session);
      if (newRoom) {
        newRoom.currentOccupancy = (newRoom.currentOccupancy || 0) + 1;
        newRoom.status = newRoom.currentOccupancy >= newRoom.capacity ? 'FULL' : 'PARTIALLY_OCCUPIED';
        await newRoom.save({ session });
      }

      // Update allocation
      oldAlloc.bedId = newBed._id;
      oldAlloc.roomId = newBed.roomId;
      oldAlloc.hostelId = newRoom?.hostelId as any;
      await oldAlloc.save({ session });

      transfer.status = 'COMPLETED';
      await transfer.save({ session });

      await session.commitTransaction();
      return transfer;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // --- CHECK OUT ---
  async checkOutStudent(allocationId: string, processedBy: string, reason: string, roomCondition: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const alloc = await HostelAllocation.findOne({ _id: allocationId, tenantId: this.tid }).session(session);
      if (!alloc) throw new NotFoundError('Allocation not found');

      alloc.status = 'CHECKED_OUT';
      alloc.checkOutDate = new Date();
      await alloc.save({ session });

      const bed = await HostelBed.findOne({ _id: alloc.bedId }).session(session);
      if (bed) {
        bed.status = 'AVAILABLE';
        bed.currentAllocationId = undefined;
        await bed.save({ session });

        const room = await HostelRoom.findOne({ _id: bed.roomId }).session(session);
        if (room) {
          room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
          room.status = room.currentOccupancy === 0 ? 'AVAILABLE' : 'PARTIALLY_OCCUPIED';
          await room.save({ session });
        }
      }

      const checkout = await HostelCheckOut.create([{
        tenantId: this.tid,
        allocationId: alloc._id,
        studentId: alloc.studentId,
        checkOutDate: new Date(),
        reason,
        roomCondition,
        processedBy: new mongoose.Types.ObjectId(processedBy)
      }], { session });

      await session.commitTransaction();
      return checkout[0];
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
