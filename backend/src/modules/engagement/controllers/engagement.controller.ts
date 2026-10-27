import { Request, Response } from 'express';
import { houseService } from '../services/House.service';
import { electionService } from '../services/Election.service';
import { achievementService } from '../services/Achievement.service';
import { sendResponse } from '../../../core/utils/response.util';

export class EngagementController {
  
  // House
  async getHouseLeaderboard(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const leaderboard = await houseService.getHouseLeaderboard(userReq.user.tenantId, req.query.academicYearId as string);
      return sendResponse({ res, data: leaderboard });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async assignHouse(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const data = { ...req.body, assignedBy: userReq.user._id };
      const assignment = await houseService.assignStudentToHouse(userReq.user.tenantId, data);
      return sendResponse({ res, data: assignment, message: 'Student assigned to house' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  // Election
  async castVote(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const result = await electionService.castVote(
        userReq.user.tenantId, 
        req.params.electionId as string, 
        userReq.user._id, // Assume voter is the authenticated user
        req.body.candidateId,
        req.ip
      );
      return sendResponse({ res, data: result, message: 'Vote cast successfully' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async tallyElection(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const results = await electionService.closeElectionAndTally(userReq.user.tenantId, req.params.electionId as string);
      return sendResponse({ res, data: results, message: 'Election tallied and results locked' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  // Achievement
  async submitAchievement(req: Request, res: Response) {
    try {
      const userReq = req as any;
      // In a real scenario, this endpoint might be called by a student or a teacher on their behalf
      const achievement = await achievementService.submitAchievement(userReq.user.tenantId, req.body.studentId || userReq.user._id, req.body);
      return sendResponse({ res, data: achievement, message: 'Achievement submitted for review' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async verifyAchievement(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const achievement = await achievementService.verifyAchievement(userReq.user.tenantId, req.params.id as string, userReq.user._id, req.body.status);
      return sendResponse({ res, data: achievement, message: `Achievement ${req.body.status}` });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }
}

export const engagementController = new EngagementController();
