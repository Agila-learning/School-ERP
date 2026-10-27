import { Task } from '../models/TaskEngine.model';
import { ApprovalRequest } from '../models/ApprovalEngine.model';
import { SLAEvent } from '../models/SLA.model';
import { ServiceRequest } from '../models/RequestEngine.model';

export class ControlCenterService {
  async getDashboardMetrics(tenantId: string) {
    const [
      pendingTasks,
      overdueTasks,
      pendingApprovals,
      openRequests,
      slaBreaches
    ] = await Promise.all([
      Task.countDocuments({ tenantId, status: { $in: ['Assigned', 'In Progress', 'Waiting'] } }),
      Task.countDocuments({ tenantId, dueDate: { $lt: new Date() }, status: { $ne: 'Completed' } }),
      ApprovalRequest.countDocuments({ tenantId, status: { $in: ['Pending', 'In Review'] } }),
      ServiceRequest.countDocuments({ tenantId, status: { $ne: 'Closed' } }),
      SLAEvent.countDocuments({ tenantId, status: 'Breached' })
    ]);

    return {
      pendingTasks,
      overdueTasks,
      pendingApprovals,
      openRequests,
      slaBreaches
    };
  }
}

export const controlCenterService = new ControlCenterService();
