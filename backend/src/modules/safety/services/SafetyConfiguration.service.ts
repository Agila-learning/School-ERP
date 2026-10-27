import mongoose from 'mongoose';
import { SafetyZone, EmergencyExit, AssemblyPoint, EmergencyPlan } from '../models/SafetyStructure.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class SafetyConfigurationService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  // --- ZONES ---
  async getZones() {
    return await SafetyZone.find({ tenantId: this.tid, isDeleted: { $ne: true } });
  }

  async createZone(data: any) {
    return await SafetyZone.create({ ...data, tenantId: this.tid });
  }

  // --- EXITS ---
  async getExits() {
    return await EmergencyExit.find({ tenantId: this.tid, isDeleted: { $ne: true } }).populate('zoneId', 'zoneName');
  }

  async createExit(data: any) {
    return await EmergencyExit.create({ ...data, tenantId: this.tid });
  }

  // --- ASSEMBLY POINTS ---
  async getAssemblyPoints() {
    return await AssemblyPoint.find({ tenantId: this.tid, isDeleted: { $ne: true } });
  }

  async createAssemblyPoint(data: any) {
    return await AssemblyPoint.create({ ...data, tenantId: this.tid });
  }

  // --- EMERGENCY PLANS ---
  async getPlans() {
    return await EmergencyPlan.find({ tenantId: this.tid, isDeleted: { $ne: true } });
  }

  async createPlan(data: any) {
    return await EmergencyPlan.create({ ...data, tenantId: this.tid });
  }
}
