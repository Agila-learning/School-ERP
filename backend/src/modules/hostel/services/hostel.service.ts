import mongoose from 'mongoose';
import Hostel from '../models/Hostel.model';
import { HostelBuilding } from '../models/HostelBuilding.model';
import { HostelBlock, HostelFloor } from '../models/HostelStructure.model';
import { HostelRoom, HostelBed } from '../models/HostelRoom.model';
import HostelAllocation from '../models/HostelAllocation.model';
import HostelApplication from '../models/HostelApplication.model';
import { HostelComplaint } from '../models/HostelComplaint.model';
import HostelOutpass from '../models/HostelOutpass.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class HostelService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getHostels(branchId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (branchId) q.branchId = new mongoose.Types.ObjectId(branchId);
    return Hostel.find(q).populate('wardenId assistantWardenId', 'firstName lastName employeeId');
  }

  async createHostel(data: any) {
    let branchId = data.branchId;
    if (!branchId) {
      try {
        const Branch = mongoose.models['Branch'] || mongoose.model('Branch');
        const b = await Branch.findOne({ tenantId: this.tid });
        if (b) branchId = b._id;
      } catch (e) {}
      if (!branchId) branchId = new mongoose.Types.ObjectId();
    }
    let academicYearId = data.academicYearId;
    if (!academicYearId) {
      try {
        const AcademicYear = mongoose.models['AcademicYear'] || mongoose.model('AcademicYear');
        const ay = await AcademicYear.findOne({ tenantId: this.tid });
        if (ay) academicYearId = ay._id;
      } catch (e) {}
      if (!academicYearId) academicYearId = new mongoose.Types.ObjectId();
    }
    return Hostel.create({
      ...data,
      code: data.code || `H-${Date.now().toString().slice(-4)}`,
      name: data.name || 'Main Hostel',
      hostelType: data.hostelType || 'BOYS',
      genderApplicability: data.genderApplicability || (data.hostelType === 'GIRLS' ? 'FEMALE' : data.hostelType === 'BOYS' ? 'MALE' : 'MIXED'),
      totalCapacity: Number(data.totalCapacity) || 100,
      branchId,
      academicYearId,
      tenantId: this.tid
    });
  }

  async updateHostel(id: string, data: any) {
    const hostel = await Hostel.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!hostel) throw new NotFoundError('Hostel not found');
    return hostel;
  }

  async deleteHostel(id: string) {
    const hostel = await Hostel.findOneAndUpdate({ _id: id, tenantId: this.tid }, { isDeleted: true }, { new: true });
    if (!hostel) throw new NotFoundError('Hostel not found');
    return hostel;
  }

  async getBuildings(hostelId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    return HostelBuilding.find(q);
  }

  async createBuilding(hostelId: string, data: any) {
    const hostel = await Hostel.findOne({ _id: hostelId, tenantId: this.tid });
    if (!hostel) throw new NotFoundError('Hostel not found');
    return HostelBuilding.create({
      ...data,
      code: data.code || `BLD-${Date.now().toString().slice(-4)}`,
      numberOfFloors: Number(data.numberOfFloors) || 3,
      capacity: Number(data.capacity) || 50,
      tenantId: this.tid,
      hostelId
    });
  }

  async updateBuilding(id: string, data: any) {
    const building = await HostelBuilding.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!building) throw new NotFoundError('Building not found');
    return building;
  }

  async deleteBuilding(id: string) {
    const building = await HostelBuilding.findOneAndUpdate({ _id: id, tenantId: this.tid }, { isDeleted: true }, { new: true });
    if (!building) throw new NotFoundError('Building not found');
    return building;
  }

  async getBlocks(buildingId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (buildingId) q.buildingId = new mongoose.Types.ObjectId(buildingId);
    return HostelBlock.find(q).populate('wardenId', 'firstName lastName');
  }

  async createBlock(buildingId: string, data: any) {
    const building = await HostelBuilding.findOne({ _id: buildingId, tenantId: this.tid });
    if (!building) throw new NotFoundError('Building not found');
    return HostelBlock.create({
      ...data,
      name: data.name || data.blockName || 'Block A',
      capacity: Number(data.capacity) || 50,
      floorCount: Number(data.floorCount) || 1,
      tenantId: this.tid,
      buildingId,
      hostelId: building.hostelId
    });
  }

  async updateBlock(id: string, data: any) {
    const block = await HostelBlock.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!block) throw new NotFoundError('Block not found');
    return block;
  }

  async deleteBlock(id: string) {
    const block = await HostelBlock.findOneAndUpdate({ _id: id, tenantId: this.tid }, { isDeleted: true }, { new: true });
    if (!block) throw new NotFoundError('Block not found');
    return block;
  }

  async getFloors(blockId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (blockId) q.blockId = new mongoose.Types.ObjectId(blockId);
    return HostelFloor.find(q);
  }

  async createFloor(blockId: string, data: any) {
    return HostelFloor.create({
      ...data,
      floorNumber: String(data.floorNumber || 1),
      floorName: data.floorName || `Floor ${data.floorNumber || 1}`,
      capacity: Number(data.capacity) || 50,
      tenantId: this.tid,
      blockId
    });
  }

  async updateFloor(id: string, data: any) {
    const floor = await HostelFloor.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!floor) throw new NotFoundError('Floor not found');
    return floor;
  }

  async deleteFloor(id: string) {
    const floor = await HostelFloor.findOneAndUpdate({ _id: id, tenantId: this.tid }, { isDeleted: true }, { new: true });
    if (!floor) throw new NotFoundError('Floor not found');
    return floor;
  }

  async getRooms(floorId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (floorId) q.floorId = new mongoose.Types.ObjectId(floorId);
    return HostelRoom.find(q).populate('hostelId buildingId blockId floorId');
  }

  async createRoom(data: any) {
    const cleanData: any = { ...data, tenantId: this.tid };
    if (!cleanData.buildingId) delete cleanData.buildingId;
    if (!cleanData.blockId) delete cleanData.blockId;
    if (!cleanData.floorId) delete cleanData.floorId;
    if (!cleanData.roomType) cleanData.roomType = 'DOUBLE';
    if (!cleanData.genderApplicability) cleanData.genderApplicability = 'MIXED';
    cleanData.capacity = Number(cleanData.capacity) || 2;

    const room = await HostelRoom.create(cleanData);
    
    // Auto-generate beds
    const bedsToCreate = [];
    for (let i = 1; i <= cleanData.capacity; i++) {
      bedsToCreate.push({
        tenantId: this.tid,
        roomId: room._id,
        bedNumber: `B${i}`,
        status: 'AVAILABLE'
      });
    }
    if (bedsToCreate.length > 0) {
      await HostelBed.insertMany(bedsToCreate);
    }
    return room;
  }

  async updateRoom(id: string, data: any) {
    const room = await HostelRoom.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!room) throw new NotFoundError('Room not found');
    return room;
  }

  async deleteRoom(id: string) {
    const room = await HostelRoom.findOneAndUpdate({ _id: id, tenantId: this.tid }, { isDeleted: true }, { new: true });
    if (!room) throw new NotFoundError('Room not found');
    return room;
  }

  async getBeds(roomId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (roomId) q.roomId = new mongoose.Types.ObjectId(roomId);
    return HostelBed.find(q)
      .populate('roomId', 'roomNumber roomType capacity currentOccupancy status genderApplicability floorId blockId')
      .populate({
        path: 'currentAllocationId',
        populate: { path: 'studentId', select: 'firstName lastName admissionNumber studentId phone' }
      });
  }

  async createBed(roomId: string, data: any) {
    const room = await HostelRoom.findOne({ _id: roomId, tenantId: this.tid });
    if (!room) throw new NotFoundError('Room not found');
    return HostelBed.create({ ...data, tenantId: this.tid, roomId });
  }

  async updateBed(id: string, data: any) {
    const bed = await HostelBed.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!bed) throw new NotFoundError('Bed not found');
    return bed;
  }

  async deleteBed(id: string) {
    const bed = await HostelBed.findOneAndUpdate({ _id: id, tenantId: this.tid }, { isDeleted: true }, { new: true });
    if (!bed) throw new NotFoundError('Bed not found');
    return bed;
  }

  async getOccupancySummary(hostelId: string) {
    const oid = new mongoose.Types.ObjectId(hostelId);
    const [total, occupied, maintenance] = await Promise.all([
      HostelBed.countDocuments({ tenantId: this.tid, roomId: { $in: await this.getRoomIds(oid) }, isDeleted: { $ne: true } }),
      HostelBed.countDocuments({ tenantId: this.tid, roomId: { $in: await this.getRoomIds(oid) }, status: 'OCCUPIED', isDeleted: { $ne: true } }),
      HostelBed.countDocuments({ tenantId: this.tid, roomId: { $in: await this.getRoomIds(oid) }, status: 'MAINTENANCE', isDeleted: { $ne: true } }),
    ]);
    return { total, occupied, available: total - occupied - maintenance, maintenance, occupancyPct: total > 0 ? Math.round((occupied / total) * 100) : 0 };
  }

  private async getRoomIds(hostelId: mongoose.Types.ObjectId) {
    const rooms = await HostelRoom.find({ tenantId: this.tid, hostelId, isDeleted: { $ne: true } }, '_id');
    return rooms.map((r: any) => r._id);
  }

  async getDashboardStats() {
    const [
      hostelsCount,
      buildingsCount,
      roomsCount,
      bedsCount,
      occupiedBeds,
      maintenanceBeds,
      pendingApplications,
      openComplaints,
      activeOutpasses
    ] = await Promise.all([
      Hostel.countDocuments({ tenantId: this.tid, isDeleted: { $ne: true } }),
      HostelBuilding.countDocuments({ tenantId: this.tid, isDeleted: { $ne: true } }),
      HostelRoom.countDocuments({ tenantId: this.tid, isDeleted: { $ne: true } }),
      HostelBed.countDocuments({ tenantId: this.tid, isDeleted: { $ne: true } }),
      HostelBed.countDocuments({ tenantId: this.tid, status: 'OCCUPIED', isDeleted: { $ne: true } }),
      HostelBed.countDocuments({ tenantId: this.tid, status: 'MAINTENANCE', isDeleted: { $ne: true } }),
      HostelApplication.countDocuments({ tenantId: this.tid, status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] }, isDeleted: { $ne: true } }),
      HostelComplaint.countDocuments({ tenantId: this.tid, status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] }, isDeleted: { $ne: true } }),
      HostelOutpass.countDocuments({ tenantId: this.tid, status: { $in: ['REQUESTED', 'PARENT_APPROVED', 'WARDEN_APPROVED', 'ACTIVE', 'OVERDUE'] }, isDeleted: { $ne: true } }),
    ]);

    return {
      hostels: hostelsCount,
      buildings: buildingsCount,
      rooms: roomsCount,
      beds: bedsCount,
      occupied: occupiedBeds,
      available: bedsCount - occupiedBeds - maintenanceBeds,
      maintenance: maintenanceBeds,
      occupancyPct: bedsCount > 0 ? Math.round((occupiedBeds / bedsCount) * 100) : 0,
      pendingApplications,
      openComplaints,
      activeOutpasses
    };
  }
}
