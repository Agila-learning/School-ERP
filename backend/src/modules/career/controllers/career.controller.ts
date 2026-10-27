import { Request, Response } from 'express';
import { careerProfileService } from '../services/CareerProfile.service';
import { counselingService } from '../services/Counseling.service';
import { placementService } from '../services/Placement.service';
import { sendResponse } from '../../../core/utils/response.util';

export class CareerController {
  
  // Profile
  async getProfile(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const studentId = req.params.studentId || userReq.user._id;
      const profile = await careerProfileService.getOrCreateProfile(userReq.user.tenantId, studentId, req.query.academicYearId as string);
      return sendResponse({ res, data: profile });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  // Counseling
  async bookAppointment(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const appointment = await counselingService.bookAppointment(userReq.user.tenantId, userReq.user._id, req.body);
      return sendResponse({ res, data: appointment, message: 'Appointment requested successfully' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  // Placement
  async applyJob(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const application = await placementService.applyForJob(userReq.user.tenantId, userReq.user._id, req.params.jobId as string);
      return sendResponse({ res, data: application, message: 'Applied successfully' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }
}

export const careerController = new CareerController();
