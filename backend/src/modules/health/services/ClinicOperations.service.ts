import mongoose from 'mongoose';
import { MedicalVisit, MedicalVital, MedicalTreatment } from '../models/Clinic.model';
import { MedicalEmergency, MedicalReferral, MedicalFollowUp, MedicalCertificate } from '../models/Emergency.model';
import { NotFoundError } from '../../../core/errors/AppError';
// NotificationService will be integrated later

export class ClinicOperationsService {
  private tenantId: string;
  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return mongoose.isValidObjectId(this.tenantId) ? new mongoose.Types.ObjectId(this.tenantId) : this.tenantId;
  }

  // --- MEDICAL VISITS ---
  async getVisits(filters: any = {}) {
    const q: any = { tenantId: { $in: [this.tid, this.tenantId] }, isDeleted: { $ne: true } };
    if (filters.studentId && mongoose.isValidObjectId(filters.studentId)) {
      q.studentId = new mongoose.Types.ObjectId(filters.studentId);
    }
    if (filters.status) q.status = filters.status;
    if (filters.visitType) q.visitType = filters.visitType;
    return await MedicalVisit.find(q).sort({ date: -1, createdAt: -1 });
  }

  async createVisit(data: any, providerId?: string) {
    const visitNumber = 'V-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const payload: any = { ...data, visitNumber, tenantId: this.tid };
    if (providerId && mongoose.isValidObjectId(providerId)) {
      payload.providerId = new mongoose.Types.ObjectId(providerId);
    } else {
      delete payload.providerId;
    }
    if (payload.studentId && mongoose.isValidObjectId(payload.studentId)) {
      payload.studentId = new mongoose.Types.ObjectId(payload.studentId);
    } else {
      delete payload.studentId;
    }
    if (!payload.date) payload.date = new Date();
    if (!payload.time) payload.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return await MedicalVisit.create(payload);
  }

  async updateVisit(visitId: string, data: any) {
    const payload = { ...data };
    if (payload.studentId && !mongoose.isValidObjectId(payload.studentId)) delete payload.studentId;
    if (payload.providerId && !mongoose.isValidObjectId(payload.providerId)) delete payload.providerId;
    const visit = await MedicalVisit.findOneAndUpdate(
      { _id: visitId, tenantId: { $in: [this.tid, this.tenantId] } },
      payload,
      { new: true }
    );
    if (!visit) throw new NotFoundError('Visit not found');
    return visit;
  }

  async deleteVisit(visitId: string) {
    const visit = await MedicalVisit.findOneAndUpdate(
      { _id: visitId, tenantId: { $in: [this.tid, this.tenantId] } },
      { isDeleted: true },
      { new: true }
    );
    if (!visit) throw new NotFoundError('Visit not found');
    return visit;
  }

  // --- VITALS ---
  async getVitals(visitId: string) {
    return await MedicalVital.find({ tenantId: { $in: [this.tid, this.tenantId] }, visitId: new mongoose.Types.ObjectId(visitId), isDeleted: { $ne: true } });
  }

  async recordVitals(visitId: string, data: any) {
    return await MedicalVital.create({ ...data, visitId: new mongoose.Types.ObjectId(visitId), tenantId: this.tid });
  }

  // --- TREATMENTS / FIRST AID ---
  async getTreatments(visitId: string) {
    return await MedicalTreatment.find({ tenantId: { $in: [this.tid, this.tenantId] }, visitId: new mongoose.Types.ObjectId(visitId), isDeleted: { $ne: true } });
  }

  async recordTreatment(visitId: string, data: any, providerId: string) {
    return await MedicalTreatment.create({ 
      ...data, 
      visitId: new mongoose.Types.ObjectId(visitId), 
      providerId: new mongoose.Types.ObjectId(providerId),
      tenantId: this.tid 
    });
  }

  // --- EMERGENCIES & REFERRALS ---
  async getEmergencies(studentId?: string) {
    const q: any = { tenantId: { $in: [this.tid, this.tenantId] }, isDeleted: { $ne: true } };
    if (studentId && mongoose.isValidObjectId(studentId)) {
      q.studentId = new mongoose.Types.ObjectId(studentId);
    }
    return await MedicalEmergency.find(q).sort({ date: -1, createdAt: -1 });
  }

  async reportEmergency(data: any, reportedByUserId?: string) {
    const emergencyNumber = 'EM-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const payload: any = {
      ...data,
      emergencyNumber,
      tenantId: this.tid
    };
    if (reportedByUserId && mongoose.isValidObjectId(reportedByUserId)) {
      payload.reportedByUserId = new mongoose.Types.ObjectId(reportedByUserId);
    }
    if (payload.studentId && mongoose.isValidObjectId(payload.studentId)) {
      payload.studentId = new mongoose.Types.ObjectId(payload.studentId);
    } else {
      delete payload.studentId;
    }
    if (!payload.date) payload.date = new Date();
    if (!payload.time) payload.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const emergency = await MedicalEmergency.create(payload);
    return emergency;
  }

  async updateEmergencyStatus(emergencyId: string, status: string, notes?: string) {
    const update: any = { status };
    if (notes) update.notes = notes;
    if (status === 'PARENT_CONTACTED') update.parentContacted = true;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      if (notes) update.outcome = notes;
    }
    const emergency = await MedicalEmergency.findOneAndUpdate(
      { _id: emergencyId, tenantId: { $in: [this.tid, this.tenantId] } },
      update,
      { new: true }
    );
    if (!emergency) throw new NotFoundError('Emergency not found');
    return emergency;
  }

  async deleteEmergency(emergencyId: string) {
    const emergency = await MedicalEmergency.findOneAndUpdate(
      { _id: emergencyId, tenantId: { $in: [this.tid, this.tenantId] } },
      { isDeleted: true },
      { new: true }
    );
    if (!emergency) throw new NotFoundError('Emergency not found');
    return emergency;
  }

  async createReferral(data: any, referredByUserId: string) {
    return await MedicalReferral.create({
      ...data,
      referredByUserId: new mongoose.Types.ObjectId(referredByUserId),
      tenantId: this.tid
    });
  }

  // --- FOLLOW-UPS ---
  async getFollowUps(studentId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (studentId) q.studentId = new mongoose.Types.ObjectId(studentId);
    return await MedicalFollowUp.find(q).sort({ dueDate: 1 });
  }

  async scheduleFollowUp(data: any, providerId: string) {
    return await MedicalFollowUp.create({
      ...data,
      assignedProviderId: new mongoose.Types.ObjectId(providerId),
      tenantId: this.tid
    });
  }

  // --- CERTIFICATES ---
  async issueCertificate(data: any, providerId: string) {
    const certificateNumber = 'CERT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    return await MedicalCertificate.create({
      ...data,
      certificateNumber,
      issuedByProviderId: new mongoose.Types.ObjectId(providerId),
      tenantId: this.tid
    });
  }
}
