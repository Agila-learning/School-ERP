import mongoose from 'mongoose';
import JobRequisition from '../models/JobRequisition.model';
import Candidate from '../models/Candidate.model';
import Interview from '../models/Interview.model';
import OfferLetter from '../models/OfferLetter.model';

export class RecruitmentService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getRequisitions() {
    return JobRequisition.find({ tenantId: this.tid, isDeleted: { $ne: true } })
      .populate('departmentId', 'name')
      .populate('designationId', 'name');
  }

  async createRequisition(data: any) {
    return JobRequisition.create({ ...data, tenantId: this.tid });
  }

  async getCandidates(requisitionId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (requisitionId) filter.appliedRequisitionId = new mongoose.Types.ObjectId(requisitionId);
    return Candidate.find(filter);
  }

  async createCandidate(data: any) {
    return Candidate.create({ ...data, tenantId: this.tid });
  }

  async generateOffer(candidateId: string, data: any) {
    const candidate = await Candidate.findOne({ _id: candidateId, tenantId: this.tid });
    if (!candidate) throw new Error('Candidate not found');

    const offer = await OfferLetter.create({
      ...data,
      candidateId: candidate._id,
      tenantId: this.tid,
      offerNumber: `OFF-${Date.now()}`,
    });

    candidate.status = 'Offer Sent';
    await candidate.save();

    return offer;
  }

  // --- Candidate Management ---
  async getCandidateById(candidateId: string) {
    const candidate = await Candidate.findOne({ _id: candidateId, tenantId: this.tid, isDeleted: { $ne: true } })
      .populate('appliedRequisitionId', 'title code');
    if (!candidate) throw new Error('Candidate not found');
    return candidate;
  }

  async updateCandidate(candidateId: string, data: any) {
    const candidate = await Candidate.findOneAndUpdate(
      { _id: candidateId, tenantId: this.tid, isDeleted: { $ne: true } },
      data,
      { new: true }
    );
    if (!candidate) throw new Error('Candidate not found');
    return candidate;
  }

  async deleteCandidate(candidateId: string) {
    const candidate = await Candidate.findOneAndUpdate(
      { _id: candidateId, tenantId: this.tid },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!candidate) throw new Error('Candidate not found');
    return candidate;
  }

  // --- Interview Management ---
  async scheduleInterview(data: any) {
    const interview = await Interview.create({ ...data, tenantId: this.tid });
    
    // Update candidate status to Interview if not already
    await Candidate.findOneAndUpdate(
      { _id: data.candidateId, tenantId: this.tid },
      { status: 'Interview' }
    );
    
    return interview;
  }

  async getInterviews(candidateId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (candidateId) filter.candidateId = new mongoose.Types.ObjectId(candidateId);
    
    return Interview.find(filter)
      .populate('candidateId', 'firstName lastName candidateNumber')
      .populate('requisitionId', 'title code')
      .populate('interviewerId', 'firstName lastName');
  }

  async updateInterviewFeedback(interviewId: string, data: any) {
    const interview = await Interview.findOneAndUpdate(
      { _id: interviewId, tenantId: this.tid, isDeleted: { $ne: true } },
      data,
      { new: true }
    );
    if (!interview) throw new Error('Interview not found');
    
    // Auto-update candidate status based on recommendation if it's the final round
    if (data.status === 'COMPLETED' && data.recommendation) {
      if (['HIRE', 'STRONG_HIRE'].includes(data.recommendation)) {
        await Candidate.findOneAndUpdate({ _id: interview.candidateId }, { status: 'Shortlisted' });
      } else if (data.recommendation === 'NO_HIRE') {
        await Candidate.findOneAndUpdate({ _id: interview.candidateId }, { status: 'Rejected' });
      }
    }
    
    return interview;
  }
}
