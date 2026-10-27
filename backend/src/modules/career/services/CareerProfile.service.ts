import { StudentCareerProfile, CareerGoal } from '../models/CareerProfile.model';

export class CareerProfileService {
  async getOrCreateProfile(tenantId: string, studentId: string, academicYearId: string) {
    let profile = await StudentCareerProfile.findOne({ tenantId, studentId });
    if (!profile) {
      profile = new StudentCareerProfile({
        tenantId,
        studentId,
        academicYearId,
        careerInterests: [],
        preferredIndustries: [],
        preferredRoles: [],
        preferredLocations: [],
        skills: []
      });
      await profile.save();
    }
    return profile;
  }

  async updateProfile(tenantId: string, studentId: string, data: any) {
    const profile = await StudentCareerProfile.findOneAndUpdate(
      { tenantId, studentId },
      { $set: data },
      { new: true, upsert: true }
    );
    return profile;
  }

  async addCareerGoal(tenantId: string, studentId: string, data: any) {
    const goal = new CareerGoal({
      ...data,
      tenantId,
      studentId
    });
    return await goal.save();
  }
}

export const careerProfileService = new CareerProfileService();
