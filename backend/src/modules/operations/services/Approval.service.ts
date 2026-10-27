import { ApprovalRequest, ApprovalWorkflow } from '../models/ApprovalEngine.model';

export class ApprovalService {
  async createRequest(tenantId: string, workflowId: string, requesterId: string, data: any) {
    const workflow = await ApprovalWorkflow.findOne({ _id: workflowId, tenantId });
    if (!workflow) throw new Error('Workflow not found');

    const request = new ApprovalRequest({
      ...data,
      tenantId,
      workflowId,
      requestedBy: requesterId,
      currentStep: 1,
      status: 'Pending',
      history: []
    });
    return await request.save();
  }

  async processAction(tenantId: string, requestId: string, actionBy: string, actionType: string, comments?: string) {
    const request = await ApprovalRequest.findOne({ _id: requestId, tenantId }).populate('workflowId');
    if (!request) throw new Error('Approval request not found');

    if (request.status !== 'Pending' && request.status !== 'In Review') {
      throw new Error(`Cannot perform action on request with status: ${request.status}`);
    }

    const workflow = request.workflowId as any;
    const currentStepConfig = workflow.steps.find((s: any) => s.stepOrder === request.currentStep);
    
    // Add history
    request.history.push({
      actionBy: actionBy as any,
      actionType: actionType as any,
      comments,
      actionDate: new Date(),
      step: request.currentStep
    });

    if (actionType === 'Approve') {
      // Check if it's the last step
      const isLastStep = request.currentStep === Math.max(...workflow.steps.map((s: any) => s.stepOrder));
      
      if (isLastStep) {
        request.status = 'Approved';
      } else {
        request.currentStep += 1;
        request.status = 'Pending';
      }
    } else if (actionType === 'Reject') {
      request.status = 'Rejected';
    } else if (actionType === 'Return') {
      request.status = 'Returned';
      if (request.currentStep > 1) {
        request.currentStep -= 1;
      }
    }

    return await request.save();
  }
}

export const approvalService = new ApprovalService();
