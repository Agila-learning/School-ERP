import { Request, Response } from 'express';
import { alumniProfileService } from '../services/AlumniProfile.service';
import { alumniNetworkingService } from '../services/AlumniNetworking.service';
import { alumniMentorshipService } from '../services/AlumniMentorship.service';
import { alumniFundraisingService } from '../services/AlumniFundraising.service';
import { sendResponse } from '../../../core/utils/response.util';

export class AlumniController {
  
  // -- Profiles --
  async convertStudent(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const data = { ...req.body, tenantId: userReq.user.tenantId };
      const profile = await alumniProfileService.convertStudentToAlumni(data);
      return sendResponse({ res, data: profile, message: 'Student converted to Alumni successfully' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async getDirectory(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const filters = req.query;
      const profiles = await alumniProfileService.searchDirectory(userReq.user.tenantId, filters, userReq.user.role);
      return sendResponse({ res, data: profiles });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      // Stub for updating the alumni profile
      return sendResponse({ res, data: { message: 'Profile updated' } });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  // -- Mentorship --
  async getMentors(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const mentors = await alumniMentorshipService.getAvailableMentors(userReq.user.tenantId, req.query);
      return sendResponse({ res, data: mentors });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  // -- Jobs --
  async getJobs(req: Request, res: Response) {
    try {
      return sendResponse({ res, data: [] });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async postJob(req: Request, res: Response) {
    try {
      return sendResponse({ res, data: { message: 'Job posted for review' } });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  // -- Events --
  async getEvents(req: Request, res: Response) {
    try {
      return sendResponse({ res, data: [] });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  // -- Fundraising --
  async getCampaigns(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const campaigns = await alumniFundraisingService.getActiveCampaigns(userReq.user.tenantId);
      return sendResponse({ res, data: campaigns });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }
}

export const alumniController = new AlumniController();
