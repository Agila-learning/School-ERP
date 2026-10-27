import mongoose from 'mongoose';
import Laboratory from '../models/Laboratory.model';
import LabEquipment from '../models/LabEquipment.model';
import LabInventory from '../models/LabInventory.model';
import LabBooking from '../models/LabBooking.model';
import LabSession from '../models/LabSession.model';
import LabMaintenance from '../models/LabMaintenance.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class LabService {
  private tid: any;
  private tidFilter: any;

  constructor(tenantId: any) {
    this.tid = tenantId || 'FIC001';
    this.tidFilter = { $in: [this.tid, ...(this.tid && mongoose.Types.ObjectId.isValid(this.tid) ? [new mongoose.Types.ObjectId(this.tid)] : [])] };
  }

  private toIdOrVal(val: any) {
    if (!val) return undefined;
    return mongoose.Types.ObjectId.isValid(val) ? new mongoose.Types.ObjectId(val) : val;
  }

  // --- Dashboard Stats ---
  async getDashboardStats() {
    await this.ensureSeedData();

    const [totalLabs, activeLabs, totalEquipment, availableEquipment, maintenanceCount, lowStockInventory, upcomingBookings, scheduledSessions] = await Promise.all([
      Laboratory.countDocuments({ tenantId: this.tidFilter, isDeleted: { $ne: true } }),
      Laboratory.countDocuments({ tenantId: this.tidFilter, status: 'ACTIVE', isDeleted: { $ne: true } }),
      LabEquipment.countDocuments({ tenantId: this.tidFilter, isDeleted: { $ne: true } }),
      LabEquipment.countDocuments({ tenantId: this.tidFilter, status: 'AVAILABLE', isDeleted: { $ne: true } }),
      LabMaintenance.countDocuments({ tenantId: this.tidFilter, status: { $in: ['REPORTED', 'SCHEDULED', 'IN_PROGRESS'] }, isDeleted: { $ne: true } }),
      LabInventory.countDocuments({ tenantId: this.tidFilter, status: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] }, isDeleted: { $ne: true } }),
      LabBooking.countDocuments({ tenantId: this.tidFilter, status: { $in: ['PENDING', 'APPROVED'] }, isDeleted: { $ne: true } }),
      LabSession.countDocuments({ tenantId: this.tidFilter, status: 'SCHEDULED', isDeleted: { $ne: true } })
    ]);

    const recentBookings = await LabBooking.find({ tenantId: this.tidFilter, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentMaintenance = await LabMaintenance.find({ tenantId: this.tidFilter, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      totalLabs,
      activeLabs,
      totalEquipment,
      availableEquipment,
      maintenanceCount,
      lowStockInventory,
      upcomingBookings,
      scheduledSessions,
      recentBookings,
      recentMaintenance
    };
  }

  // --- Baseline Seeding ---
  private async ensureSeedData() {
    try {
      const count = await Laboratory.countDocuments({ tenantId: this.tidFilter, isDeleted: { $ne: true } });
      if (count > 0) return;

      const labs = await Laboratory.create([
        {
          tenantId: this.tid,
          code: 'LAB-CS-01',
          name: 'Computer Science & AI Lab',
          labType: 'COMPUTER',
          capacity: 40,
          location: 'Building B, 2nd Floor',
          inChargeName: 'Prof. Rajesh Sharma',
          status: 'ACTIVE',
          safetyGuidelines: 'No food or drinks permitted. Wear antistatic wristbands during hardware assembly.'
        },
        {
          tenantId: this.tid,
          code: 'LAB-PHY-01',
          name: 'Physics & Optics Lab',
          labType: 'PHYSICS',
          capacity: 35,
          location: 'Building A, 1st Floor',
          inChargeName: 'Dr. Anita Roy',
          status: 'ACTIVE',
          safetyGuidelines: 'Handle laser equipment with certified protective eyewear.'
        },
        {
          tenantId: this.tid,
          code: 'LAB-CHEM-01',
          name: 'Chemistry & Molecular Analysis Lab',
          labType: 'CHEMISTRY',
          capacity: 30,
          location: 'Building A, Ground Floor',
          inChargeName: 'Dr. Vikram Patel',
          status: 'ACTIVE',
          safetyGuidelines: 'Lab coats, safety goggles, and nitrile gloves are strictly mandatory.'
        },
        {
          tenantId: this.tid,
          code: 'LAB-ROB-01',
          name: 'Robotics & STEM Tinkering Lab',
          labType: 'ROBOTICS',
          capacity: 25,
          location: 'Innovation Hub, Room 104',
          inChargeName: 'Er. Sandeep Joshi',
          status: 'ACTIVE',
          safetyGuidelines: 'Inspect power connections before powering up motor drivers.'
        }
      ]);

      const csLab = labs[0];
      const chemLab = labs[2];
      const robLab = labs[3];

      await LabEquipment.create([
        {
          tenantId: this.tid,
          laboratoryId: csLab._id,
          laboratoryName: csLab.name,
          code: 'EQ-CS-01',
          name: 'AI High-Performance Workstation',
          category: 'COMPUTING',
          manufacturer: 'Dell Precision',
          modelNumber: 'T3660 (Nvidia RTX 4080)',
          serialNumber: 'DP-9821-X',
          quantity: 20,
          condition: 'EXCELLENT',
          status: 'AVAILABLE'
        },
        {
          tenantId: this.tid,
          laboratoryId: chemLab._id,
          laboratoryName: chemLab.name,
          code: 'EQ-CHEM-01',
          name: 'Digital UV-Vis Spectrophotometer',
          category: 'ANALYTICAL',
          manufacturer: 'Shimadzu',
          modelNumber: 'UV-1900i',
          serialNumber: 'SH-5510-U',
          quantity: 3,
          condition: 'GOOD',
          status: 'AVAILABLE'
        },
        {
          tenantId: this.tid,
          laboratoryId: robLab._id,
          laboratoryName: robLab.name,
          code: 'EQ-ROB-01',
          name: 'Robotic Arm 6-DOF Kit',
          category: 'ROBOTICS',
          manufacturer: 'DOBOT',
          modelNumber: 'Magician Educational',
          serialNumber: 'DB-8841-A',
          quantity: 8,
          condition: 'GOOD',
          status: 'AVAILABLE'
        },
        {
          tenantId: this.tid,
          laboratoryId: csLab._id,
          laboratoryName: csLab.name,
          code: 'EQ-CS-02',
          name: 'Smart Interactive Board 75-inch',
          category: 'DISPLAY',
          manufacturer: 'ViewSonic',
          modelNumber: 'IFP7550',
          serialNumber: 'VS-7712-B',
          quantity: 1,
          condition: 'GOOD',
          status: 'AVAILABLE'
        }
      ]);

      await LabInventory.create([
        {
          tenantId: this.tid,
          laboratoryId: chemLab._id,
          laboratoryName: chemLab.name,
          itemCode: 'INV-CH-01',
          itemName: 'Hydrochloric Acid (HCl 37%) Analytical Grade',
          category: 'CHEMICALS',
          unit: 'Liters',
          quantity: 8,
          minimumThreshold: 5,
          storageLocation: 'Chemical Storage Cabinet A-1',
          status: 'IN_STOCK'
        },
        {
          tenantId: this.tid,
          laboratoryId: chemLab._id,
          laboratoryName: chemLab.name,
          itemCode: 'INV-CH-02',
          itemName: 'Borosilicate Glassware Set (Beakers, Flasks, Pipettes)',
          category: 'GLASSWARE',
          unit: 'Sets',
          quantity: 4,
          minimumThreshold: 6,
          storageLocation: 'Glassware Rack 2',
          status: 'LOW_STOCK'
        },
        {
          tenantId: this.tid,
          laboratoryId: robLab._id,
          laboratoryName: robLab.name,
          itemCode: 'INV-RB-01',
          itemName: 'Microcontroller Breadboard Development Kits (ESP32 / Arduino)',
          category: 'CONSUMABLES',
          unit: 'Pcs',
          quantity: 35,
          minimumThreshold: 10,
          storageLocation: 'Component Drawer D-4',
          status: 'IN_STOCK'
        }
      ]);

      await LabBooking.create([
        {
          tenantId: this.tid,
          laboratoryId: csLab._id,
          laboratoryName: csLab.name,
          requestedByName: 'Mr. Arvind Saxena',
          bookingDate: new Date(Date.now() + 86400000),
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          purpose: 'Python Data Structures Practical Exam',
          status: 'APPROVED',
          approvedByName: 'Prof. Rajesh Sharma'
        },
        {
          tenantId: this.tid,
          laboratoryId: chemLab._id,
          laboratoryName: chemLab.name,
          requestedByName: 'Ms. Pooja Nair',
          bookingDate: new Date(Date.now() + 172800000),
          startTime: '01:30 PM',
          endTime: '03:00 PM',
          purpose: 'Titration & pH Estimation Experiments',
          status: 'PENDING'
        }
      ]);

      await LabSession.create([
        {
          tenantId: this.tid,
          laboratoryId: csLab._id,
          laboratoryName: csLab.name,
          className: 'Grade 11 - Science',
          subjectName: 'Computer Science',
          teacherName: 'Mr. Arvind Saxena',
          sessionDate: new Date(),
          startTime: '11:30 AM',
          endTime: '01:00 PM',
          topic: 'Object-Oriented Programming & File Handling in C++',
          status: 'SCHEDULED'
        }
      ]);
    } catch (e) {
      console.warn('Lab auto-seed notice:', e);
    }
  }

  // --- Laboratory CRUD ---
  async getLaboratories(branchId?: string) {
    await this.ensureSeedData();
    const query: any = { tenantId: this.tidFilter, isDeleted: { $ne: true } };
    if (branchId) query.branchId = this.toIdOrVal(branchId);
    return await Laboratory.find(query).sort({ createdAt: -1 }).lean();
  }

  async createLaboratory(data: any) {
    const payload = { ...data, tenantId: this.tid };
    delete payload.id;
    delete payload._id;
    if (!payload.labType && payload.type) payload.labType = payload.type;
    if (!payload.labType) payload.labType = 'GENERAL';
    if (payload.status === 'AVAILABLE') payload.status = 'ACTIVE';
    if (!payload.code) {
      payload.code = 'LAB-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
    return await Laboratory.create(payload);
  }

  async updateLaboratory(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    delete payload._id;
    if (!payload.labType && payload.type) payload.labType = payload.type;
    if (payload.status === 'AVAILABLE') payload.status = 'ACTIVE';
    const lab = await Laboratory.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    );
    if (!lab) throw new NotFoundError('Laboratory not found');
    return lab;
  }

  async deleteLaboratory(id: string) {
    const lab = await Laboratory.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!lab) throw new NotFoundError('Laboratory not found');
    return lab;
  }

  // --- Equipment CRUD ---
  async getEquipment(laboratoryId?: string) {
    await this.ensureSeedData();
    const query: any = { tenantId: this.tidFilter, isDeleted: { $ne: true } };
    if (laboratoryId) query.laboratoryId = this.toIdOrVal(laboratoryId);
    return await LabEquipment.find(query).sort({ createdAt: -1 }).lean();
  }

  async createEquipment(data: any) {
    const payload = { ...data, tenantId: this.tid };
    delete payload.id;
    delete payload._id;
    if (!payload.code) {
      payload.code = 'EQ-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
    return await LabEquipment.create(payload);
  }

  async updateEquipment(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    delete payload._id;
    const eq = await LabEquipment.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    );
    if (!eq) throw new NotFoundError('Equipment not found');
    return eq;
  }

  async deleteEquipment(id: string) {
    return await LabEquipment.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
  }

  // --- Inventory CRUD ---
  async getInventory(laboratoryId?: string) {
    await this.ensureSeedData();
    const query: any = { tenantId: this.tidFilter, isDeleted: { $ne: true } };
    if (laboratoryId) query.laboratoryId = this.toIdOrVal(laboratoryId);
    return await LabInventory.find(query).sort({ createdAt: -1 }).lean();
  }

  async createInventory(data: any) {
    const payload = { ...data, tenantId: this.tid };
    delete payload.id;
    delete payload._id;
    if (!payload.itemCode) {
      payload.itemCode = 'INV-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
    return await LabInventory.create(payload);
  }

  async updateInventory(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    delete payload._id;
    const inv = await LabInventory.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    );
    if (!inv) throw new NotFoundError('Inventory item not found');
    return inv;
  }

  async deleteInventory(id: string) {
    return await LabInventory.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
  }

  // --- Bookings CRUD ---
  async getBookings(laboratoryId?: string) {
    await this.ensureSeedData();
    const query: any = { tenantId: this.tidFilter, isDeleted: { $ne: true } };
    if (laboratoryId) query.laboratoryId = this.toIdOrVal(laboratoryId);
    return await LabBooking.find(query).sort({ createdAt: -1 }).lean();
  }

  async createBooking(data: any) {
    const payload = { ...data, tenantId: this.tid };
    delete payload.id;
    delete payload._id;
    return await LabBooking.create(payload);
  }

  async updateBooking(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    delete payload._id;
    const booking = await LabBooking.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    );
    if (!booking) throw new NotFoundError('Booking not found');
    return booking;
  }

  async deleteBooking(id: string) {
    return await LabBooking.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
  }

  // --- Sessions CRUD ---
  async getSessions(laboratoryId?: string) {
    await this.ensureSeedData();
    const query: any = { tenantId: this.tidFilter, isDeleted: { $ne: true } };
    if (laboratoryId) query.laboratoryId = this.toIdOrVal(laboratoryId);
    return await LabSession.find(query).sort({ sessionDate: -1 }).lean();
  }

  async createSession(data: any) {
    const payload = { ...data, tenantId: this.tid };
    delete payload.id;
    delete payload._id;
    return await LabSession.create(payload);
  }

  async updateSession(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    delete payload._id;
    const session = await LabSession.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    );
    if (!session) throw new NotFoundError('Session not found');
    return session;
  }

  async deleteSession(id: string) {
    return await LabSession.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
  }

  // --- Maintenance CRUD ---
  async getMaintenanceRecords(equipmentId?: string) {
    await this.ensureSeedData();
    const query: any = { tenantId: this.tidFilter, isDeleted: { $ne: true } };
    if (equipmentId) query.equipmentId = this.toIdOrVal(equipmentId);
    return await LabMaintenance.find(query).sort({ createdAt: -1 }).lean();
  }

  async createMaintenance(data: any) {
    const payload = { ...data, tenantId: this.tid };
    delete payload.id;
    delete payload._id;
    return await LabMaintenance.create(payload);
  }

  async updateMaintenance(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    delete payload._id;
    const m = await LabMaintenance.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    );
    if (!m) throw new NotFoundError('Maintenance record not found');
    return m;
  }

  async deleteMaintenance(id: string) {
    return await LabMaintenance.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
  }
}
