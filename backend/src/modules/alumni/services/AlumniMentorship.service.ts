import { AlumniMentorProfile, MentorshipRequest, MentorshipSession } from '../models/AlumniMentorship.model';

export class AlumniMentorshipService {
  async setupMentorProfile(tenantId: string, alumniProfileId: string, data: any) {
    const existing = await AlumniMentorProfile.findOne({ tenantId, alumniProfileId });
    if (existing) {
      return await AlumniMentorProfile.findOneAndUpdate(
        { tenantId, alumniProfileId },
        { $set: data },
        { new: true }
      );
    }

    const profile = new AlumniMentorProfile({ ...data, tenantId, alumniProfileId });
    return await profile.save();
  }

  async getAvailableMentors(tenantId: string, filters: any) {
    const query: any = { tenantId, availability: 'Available' };
    if (filters.industry) query.industry = filters.industry;
    
    return await AlumniMentorProfile.find(query).populate('alumniProfileId');
  }

  async requestMentorship(tenantId: string, data: any) {
    const request = new MentorshipRequest({ ...data, tenantId });
    return await request.save();
  }

  async scheduleSession(tenantId: string, data: any) {
    const session = new MentorshipSession({ ...data, tenantId });
    return await session.save();
  }
}

export const alumniMentorshipService = new AlumniMentorshipService();
