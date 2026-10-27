import mongoose from 'mongoose';
import HostelAllocation from '../models/HostelAllocation.model';
import { HostelBed, HostelRoom } from '../models/HostelRoom.model';
import HostelApplication from '../models/HostelApplication.model';
import { HostelCheckIn, HostelCheckOut } from '../models/HostelCheckIn.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class BedAllocationService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  /**
   * Allocate a bed to a student.
   * Runs in a transaction to prevent concurrent double-booking.
   */
  async allocate(data: {
    studentId: string;
    academicYearId: string;
    hostelId: string;
    buildingId: string;
    floorId: string;
    roomId: string;
    bedId: string;
    startDate: Date;
    allocatedByUserId: string;
    applicationId?: string;
  }) {
    const bedObjId = new mongoose.Types.ObjectId(data.bedId);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Check for existing active allocation on this bed
      const conflict = await HostelAllocation.findOne({
        tenantId: this.tid,
        bedId: bedObjId,
        status: { $in: ['RESERVED', 'ACTIVE'] },
      }).session(session);

      if (conflict) throw new ValidationError('Bed is already allocated. Concurrent allocation prevented.');

      // Check student doesn't already have an overlapping active allocation
      const studentConflict = await HostelAllocation.findOne({
        tenantId: this.tid,
        studentId: new mongoose.Types.ObjectId(data.studentId),
        status: { $in: ['RESERVED', 'ACTIVE'] },
      }).session(session);

      if (studentConflict) throw new ValidationError('Student already has an active hostel allocation.');

      const [allocation] = await HostelAllocation.create([{
        tenantId: this.tid,
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        hostelId: data.hostelId,
        buildingId: data.buildingId,
        floorId: data.floorId,
        roomId: data.roomId,
        bedId: bedObjId,
        startDate: data.startDate,
        allocatedByUserId: data.allocatedByUserId,
        applicationId: data.applicationId,
        status: 'RESERVED',
      }], { session });

      // Mark bed as RESERVED
      await HostelBed.updateOne({ _id: bedObjId }, { status: 'RESERVED', currentAllocationId: allocation._id }, { session });

      // Update room occupancy
      await HostelRoom.updateOne(
        { _id: new mongoose.Types.ObjectId(data.roomId) },
        { $inc: { currentOccupancy: 1 } },
        { session }
      );

      await session.commitTransaction();
      return allocation;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Formal check-in activates the allocation.
   */
  async checkIn(allocationId: string, staffId: string, issuedItems: any[], conditionReport?: string) {
    const alloc = await HostelAllocation.findOne({ _id: new mongoose.Types.ObjectId(allocationId), tenantId: this.tid });
    if (!alloc) throw new NotFoundError('Allocation not found');
    if (alloc.status !== 'RESERVED') throw new ValidationError('Only RESERVED allocations can be checked in');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [checkIn] = await HostelCheckIn.create([{
        tenantId: this.tid,
        studentId: alloc.studentId,
        allocationId: alloc._id,
        checkInDateTime: new Date(),
        roomId: alloc.roomId,
        bedId: alloc.bedId,
        staffId,
        issuedItems,
        conditionReport,
      }], { session });

      alloc.status = 'ACTIVE';
      alloc.checkInId = checkIn._id;
      await alloc.save({ session });

      await HostelBed.updateOne({ _id: alloc.bedId }, { status: 'OCCUPIED' }, { session });

      await session.commitTransaction();
      return checkIn;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Check-out frees the bed and marks allocation COMPLETED.
   */
  async checkOut(allocationId: string, staffId: string, reason: string, returnedItems: any[], damages?: string) {
    const alloc = await HostelAllocation.findOne({ _id: new mongoose.Types.ObjectId(allocationId), tenantId: this.tid });
    if (!alloc) throw new NotFoundError('Allocation not found');
    if (alloc.status !== 'ACTIVE') throw new ValidationError('Only ACTIVE allocations can be checked out');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await HostelCheckOut.create([{
        tenantId: this.tid,
        studentId: alloc.studentId,
        allocationId: alloc._id,
        checkOutDateTime: new Date(),
        reason,
        roomId: alloc.roomId,
        bedId: alloc.bedId,
        staffId,
        returnedItems,
        damages,
        pendingDues: 0,
      }], { session });

      alloc.status = 'COMPLETED';
      alloc.actualEndDate = new Date();
      await alloc.save({ session });

      // Free the bed
      await HostelBed.updateOne({ _id: alloc.bedId }, { status: 'AVAILABLE', currentAllocationId: undefined }, { session });

      // Decrement room occupancy
      await HostelRoom.updateOne({ _id: alloc.roomId }, { $inc: { currentOccupancy: -1 } }, { session });

      await session.commitTransaction();
      return { success: true };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /**
   * Room transfer: end old allocation and start new one — history preserved.
   */
  async transfer(allocationId: string, newBedId: string, reason: string, approvedByUserId: string) {
    const alloc = await HostelAllocation.findOne({ _id: new mongoose.Types.ObjectId(allocationId), tenantId: this.tid });
    if (!alloc) throw new NotFoundError('Allocation not found');

    // End existing allocation
    await this.checkOut(allocationId, approvedByUserId, `TRANSFER: ${reason}`, []);

    // Create new allocation on new bed — fetching room/floor/building from the new bed's room
    const newBed = await HostelBed.findById(newBedId).populate('roomId');
    if (!newBed) throw new NotFoundError('New bed not found');
    const newRoom = newBed.roomId as any;

    return this.allocate({
      studentId: alloc.studentId.toString(),
      academicYearId: alloc.academicYearId.toString(),
      hostelId: alloc.hostelId.toString(),
      buildingId: newRoom.buildingId?.toString() || alloc.buildingId.toString(),
      floorId: newRoom.floorId?.toString() || alloc.floorId.toString(),
      roomId: newRoom._id.toString(),
      bedId: newBedId,
      startDate: new Date(),
      allocatedByUserId: approvedByUserId,
    });
  }
}
