import { Request, Response } from 'express';
import { facilitiesService } from '../services/Facilities.service';
import { sendResponse } from '../../../core/utils/response.util';

export class FacilitiesController {
  async createBooking(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const booking = await facilitiesService.createBooking(userReq.user.tenantId, userReq.user._id, req.body);
      return sendResponse({ res, data: booking, message: 'Facility booked successfully' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }
}

export const facilitiesController = new FacilitiesController();
