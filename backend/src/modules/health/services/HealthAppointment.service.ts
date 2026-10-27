import { HealthAppointment } from '../models/HealthAppointment.model';
import mongoose from 'mongoose';

export class HealthAppointmentService {
  static async getAppointments(tenantId: string) {
    return HealthAppointment.find({ tenantId, deletedAt: null })
      .populate('studentId providerId');
  }

  static async requestAppointment(tenantId: string, data: any) {
    const appointment = new HealthAppointment({
      tenantId: mongoose.isValidObjectId(tenantId) ? new mongoose.Types.ObjectId(tenantId) : tenantId,
      ...data
    });
    await appointment.save();
    return appointment;
  }
}
