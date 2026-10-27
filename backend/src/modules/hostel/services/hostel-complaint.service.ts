import mongoose from 'mongoose';
import { HostelComplaint } from '../models/HostelComplaint.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class HostelComplaintService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getComplaints(hostelId?: string, status?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    if (status) q.status = status;
    return HostelComplaint.find(q)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('raisedByUserId', 'firstName lastName email')
      .populate('assignedToUserId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async getMyComplaints(userId: string) {
    return HostelComplaint.find({ tenantId: this.tid, raisedByUserId: new mongoose.Types.ObjectId(userId), isDeleted: { $ne: true } })
      .populate('assignedToUserId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async createComplaint(data: any) {
    let hostelId = data.hostelId;
    if (!hostelId) {
      try {
        const Hostel = mongoose.models['Hostel'] || mongoose.model('Hostel');
        const h = await Hostel.findOne({ tenantId: this.tid });
        if (h) hostelId = h._id;
      } catch (e) {}
    }
    return HostelComplaint.create({
      ...data,
      hostelId: hostelId || new mongoose.Types.ObjectId(),
      title: data.title || `${data.category || 'Hostel'} Issue`,
      description: data.description || 'Hostel maintenance issue',
      status: 'OPEN',
      tenantId: this.tid
    });
  }

  async getIncidents(hostelId?: string) {
    const { HostelIncident } = await import('../models/HostelComplaint.model');
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (hostelId) q.hostelId = new mongoose.Types.ObjectId(hostelId);
    return HostelIncident.find(q).sort({ createdAt: -1 });
  }

  async createIncident(data: any) {
    const { HostelIncident } = await import('../models/HostelComplaint.model');
    let hostelId = data.hostelId;
    if (!hostelId) {
      try {
        const Hostel = mongoose.models['Hostel'] || mongoose.model('Hostel');
        const h = await Hostel.findOne({ tenantId: this.tid });
        if (h) hostelId = h._id;
      } catch (e) {}
    }
    return HostelIncident.create({
      ...data,
      hostelId: hostelId || new mongoose.Types.ObjectId(),
      incidentType: data.incidentType || data.type || 'MEDICAL',
      severity: data.severity || 'MEDIUM',
      description: data.description || 'Emergency incident reported',
      tenantId: this.tid
    });
  }

  async updateComplaintStatus(id: string, status: string, notes?: string, assignedToUserId?: string) {
    const complaint = await HostelComplaint.findOne({ _id: id, tenantId: this.tid });
    if (!complaint) throw new NotFoundError('Complaint not found');

    complaint.status = status as any;
    if (notes) complaint.resolutionNotes = notes;
    
    if (status === 'ASSIGNED' && assignedToUserId) {
      complaint.assignedToUserId = new mongoose.Types.ObjectId(assignedToUserId);
      complaint.assignedAt = new Date();
    }
    
    if (status === 'RESOLVED' || status === 'CLOSED') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();
    return complaint;
  }
}
