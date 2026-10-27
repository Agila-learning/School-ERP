import { SchoolHouse, HouseMembership, HousePointTransaction } from '../models/House.model';

export class HouseService {
  async createHouse(tenantId: string, houseData: any) {
    const house = new SchoolHouse({ ...houseData, tenantId });
    return await house.save();
  }

  async assignStudentToHouse(tenantId: string, data: { studentId: string, houseId: string, academicYearId: string, assignedBy: string, reason?: string }) {
    // Check for existing active assignment
    const existing = await HouseMembership.findOne({
      tenantId,
      academicYearId: data.academicYearId,
      studentId: data.studentId,
      status: 'Active'
    });

    if (existing) {
      if (existing.houseId.toString() === data.houseId) {
        throw new Error('Student is already assigned to this house');
      }
      existing.status = 'Transferred';
      await existing.save();
    }

    const membership = new HouseMembership({
      ...data,
      tenantId
    });
    return await membership.save();
  }

  async awardPoints(tenantId: string, data: any) {
    const transaction = new HousePointTransaction({
      ...data,
      tenantId
    });
    return await transaction.save();
  }

  async getHouseLeaderboard(tenantId: string, academicYearId: string) {
    const leaderboard = await HousePointTransaction.aggregate([
      { $match: { tenantId, academicYearId, status: 'Posted' } },
      { $group: { _id: '$houseId', totalPoints: { $sum: '$points' } } },
      { $lookup: { from: 'schoolhouses', localField: '_id', foreignField: '_id', as: 'house' } },
      { $unwind: '$house' },
      { $sort: { totalPoints: -1 } },
      { $project: { houseName: '$house.houseName', houseColor: '$house.houseColor', totalPoints: 1 } }
    ]);
    return leaderboard;
  }
}

export const houseService = new HouseService();
