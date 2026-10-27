import mongoose from 'mongoose';
import { RiskRegister, SafetyHazard, SafetyInspection, CorrectiveAction } from '../models/RiskManagement.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class RiskAndHazardService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  // --- RISKS ---
  async getRisks() {
    return await RiskRegister.find({ tenantId: this.tid, isDeleted: { $ne: true } }).populate('ownerId', 'firstName lastName');
  }

  async createRisk(data: any) {
    return await RiskRegister.create({ ...data, tenantId: this.tid });
  }

  // --- HAZARDS ---
  async getHazards() {
    return await SafetyHazard.find({ tenantId: this.tid, isDeleted: { $ne: true } })
      .populate('reportedByUserId', 'firstName lastName')
      .populate('assignedToUserId', 'firstName lastName');
  }

  async createHazard(data: any, reportedByUserId: string) {
    const hazardId = 'HAZ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return await SafetyHazard.create({
      ...data,
      hazardId,
      reportedByUserId: new mongoose.Types.ObjectId(reportedByUserId),
      tenantId: this.tid
    });
  }

  // --- INSPECTIONS ---
  async getInspections() {
    return await SafetyInspection.find({ tenantId: this.tid, isDeleted: { $ne: true } }).populate('inspectorId', 'firstName lastName');
  }

  async createInspection(data: any, inspectorId: string) {
    return await SafetyInspection.create({
      ...data,
      inspectorId: new mongoose.Types.ObjectId(inspectorId),
      tenantId: this.tid
    });
  }

  // --- CORRECTIVE ACTIONS ---
  async getCorrectiveActions() {
    return await CorrectiveAction.find({ tenantId: this.tid, isDeleted: { $ne: true } }).populate('ownerId', 'firstName lastName');
  }

  async createCorrectiveAction(data: any) {
    const actionNumber = 'CA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return await CorrectiveAction.create({
      ...data,
      actionNumber,
      tenantId: this.tid
    });
  }
}
