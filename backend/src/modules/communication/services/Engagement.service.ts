import mongoose from 'mongoose';
import Complaint from '../models/Complaint.model';
import Feedback from '../models/Feedback.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class EngagementService {
  
  // -- Complaints --
  static async createComplaint(tenantId: string, data: any, submittedBy: string) {
    return Complaint.create({
      ...data,
      tenantId: new mongoose.Types.ObjectId(tenantId),
      complaintNumber: `CMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      submittedBy: new mongoose.Types.ObjectId(submittedBy)
    });
  }

  static async assignComplaint(tenantId: string, complaintId: string, assignedTo: string) {
    const complaint = await Complaint.findOneAndUpdate(
      { _id: complaintId, tenantId },
      { assignedTo: new mongoose.Types.ObjectId(assignedTo), status: 'ASSIGNED' },
      { new: true }
    );
    if (!complaint) throw new NotFoundError('Complaint not found');
    return complaint;
  }

  static async resolveComplaint(tenantId: string, complaintId: string, resolution: string, resolvedBy: string) {
    const complaint = await Complaint.findOneAndUpdate(
      { _id: complaintId, tenantId },
      { 
        status: 'RESOLVED', 
        resolution, 
        resolvedBy: new mongoose.Types.ObjectId(resolvedBy),
        resolvedAt: new Date()
      },
      { new: true }
    );
    if (!complaint) throw new NotFoundError('Complaint not found');
    return complaint;
  }

  // -- Feedback --
  static async submitFeedback(tenantId: string, data: any, submittedBy: string) {
    return Feedback.create({
      ...data,
      tenantId: new mongoose.Types.ObjectId(tenantId),
      submittedBy: new mongoose.Types.ObjectId(submittedBy)
    });
  }

  static async respondToFeedback(tenantId: string, feedbackId: string, response: string, respondedBy: string) {
    const feedback = await Feedback.findOneAndUpdate(
      { _id: feedbackId, tenantId },
      { 
        status: 'CLOSED', 
        response, 
        respondedBy: new mongoose.Types.ObjectId(respondedBy),
        respondedAt: new Date()
      },
      { new: true }
    );
    if (!feedback) throw new NotFoundError('Feedback not found');
    return feedback;
  }
}
