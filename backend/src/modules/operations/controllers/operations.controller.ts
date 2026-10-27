import { Request, Response } from 'express';
import { controlCenterService } from '../services/ControlCenter.service';
import { taskService } from '../services/Task.service';
import { approvalService } from '../services/Approval.service';
import { sendResponse } from '../../../core/utils/response.util';

export class OperationsController {
  
  async getDashboard(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const metrics = await controlCenterService.getDashboardMetrics(userReq.user.tenantId);
      return sendResponse({ res, data: metrics });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const task = await taskService.createTask(userReq.user.tenantId, {
        ...req.body,
        createdBy: userReq.user._id
      });
      return sendResponse({ res, data: task, message: 'Task created' });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }

  async processApproval(req: Request, res: Response) {
    try {
      const userReq = req as any;
      const { actionType, comments } = req.body;
      const request = await approvalService.processAction(userReq.user.tenantId, req.params.requestId as string, userReq.user._id, actionType, comments);
      return sendResponse({ res, data: request, message: `Approval ${actionType.toLowerCase()}ed` });
    } catch (error: any) {
      return sendResponse({ res, status: 400, message: error.message });
    }
  }
}

export const operationsController = new OperationsController();
