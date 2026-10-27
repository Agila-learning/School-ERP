import { JobApplication, JobOffer, JobOpening } from '../models/Placement.model';

export class PlacementService {
  async applyForJob(tenantId: string, studentId: string, jobId: string) {
    const job = await JobOpening.findOne({ _id: jobId, tenantId });
    if (!job) throw new Error('Job opening not found');
    
    if (job.status !== 'Open') {
      throw new Error('This job is no longer accepting applications');
    }

    if (new Date() > new Date(job.applicationDeadline)) {
      throw new Error('Application deadline has passed');
    }

    try {
      const application = new JobApplication({
        tenantId,
        studentId,
        jobId,
        driveId: job.driveId,
        status: 'Applied'
      });
      return await application.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('You have already applied for this job');
      }
      throw error;
    }
  }

  async issueOffer(tenantId: string, data: any) {
    const application = await JobApplication.findOneAndUpdate(
      { tenantId, studentId: data.studentId, jobId: data.jobId },
      { $set: { status: 'Offer Issued' } }
    );
    
    if (!application) throw new Error('Student has not applied for this job or application not found');

    const offer = new JobOffer({
      ...data,
      tenantId
    });
    return await offer.save();
  }
}

export const placementService = new PlacementService();
