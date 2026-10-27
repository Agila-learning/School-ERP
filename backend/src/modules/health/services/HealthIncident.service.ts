import { HealthIncident } from '../models/HealthIncident.model';
import mongoose from 'mongoose';

export class HealthIncidentService {
  static async getIncidents(tenantId: string) {
    return HealthIncident.find({ tenantId, deletedAt: null })
      .populate('studentId employeeId reportedByUserId');
  }

  static async reportIncident(tenantId: string, data: any, reportedByUserId: string) {
    const incident = new HealthIncident({
      tenantId: mongoose.isValidObjectId(tenantId) ? new mongoose.Types.ObjectId(tenantId) : tenantId,
      reportedByUserId: mongoose.isValidObjectId(reportedByUserId) ? new mongoose.Types.ObjectId(reportedByUserId) : reportedByUserId,
      ...data
    });
    await incident.save();
    return incident;
  }
}
