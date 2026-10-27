import { StudentAchievement } from '../models/CoCurricular.model';

export class AchievementService {
  async submitAchievement(tenantId: string, studentId: string, data: any) {
    const achievement = new StudentAchievement({
      ...data,
      tenantId,
      studentId,
      verificationStatus: 'Submitted'
    });
    return await achievement.save();
  }

  async verifyAchievement(tenantId: string, achievementId: string, verifierId: string, status: 'Verified' | 'Rejected' | 'Needs Evidence') {
    const achievement = await StudentAchievement.findOneAndUpdate(
      { _id: achievementId, tenantId },
      { $set: { verificationStatus: status, verifiedBy: verifierId } },
      { new: true }
    );
    if (!achievement) throw new Error('Achievement not found');
    return achievement;
  }
}

export const achievementService = new AchievementService();
