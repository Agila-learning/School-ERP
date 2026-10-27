import mongoose from 'mongoose';
import { Resignation, ExitClearance, FinalSettlement } from '../models/Exit.model';
import Employee from '../models/Employee.model';

export class ExitService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getResignations(employeeId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) {
      filter.employeeId = new mongoose.Types.ObjectId(employeeId);
    }
    
    return Resignation.find(filter).populate('employeeId', 'firstName lastName employeeIdNumber departmentId designationId');
  }

  async submitResignation(data: any) {
    const activeStatuses = ['SUBMITTED', 'PENDING_PRINCIPAL', 'PRINCIPAL_APPROVED', 'PENDING_HR', 'HR_APPROVED', 'PENDING_ADMIN', 'ACCEPTED'];
    const existing = await Resignation.findOne({ 
      employeeId: data.employeeId, 
      tenantId: this.tid, 
      status: { $in: activeStatuses },
      isDeleted: { $ne: true }
    });
    if (existing) throw new Error('Active resignation already exists for this employee');

    const resignation = await Resignation.create({ 
      ...data, 
      tenantId: this.tid, 
      status: 'PENDING_PRINCIPAL',
      principalApproval: { status: 'PENDING' },
      hrApproval: { status: 'PENDING' },
      adminApproval: { status: 'PENDING' }
    });

    // Auto-create departmental exit clearances
    const departments = ['HR', 'FINANCE', 'IT', 'LIBRARY', 'ADMIN'];
    for (const dept of departments) {
      await ExitClearance.findOneAndUpdate(
        { tenantId: this.tid, resignationId: resignation._id, department: dept },
        { employeeId: resignation.employeeId, cleared: false },
        { upsert: true, new: true }
      );
    }

    return resignation;
  }

  async updateResignationStatus(resignationId: string, status: string, approvedLastWorkingDate?: string, actionMetadata?: any) {
    const updatePayload: any = { status };
    if (approvedLastWorkingDate) {
      updatePayload.approvedLastWorkingDate = new Date(approvedLastWorkingDate);
    }

    // Step-by-step 3-tier approval hierarchy
    if (status === 'PRINCIPAL_APPROVED') {
      updatePayload['principalApproval.status'] = 'APPROVED';
      updatePayload['principalApproval.approvedAt'] = new Date();
      if (actionMetadata?.comments) updatePayload['principalApproval.comments'] = actionMetadata.comments;
      if (actionMetadata?.userId) updatePayload['principalApproval.approvedBy'] = actionMetadata.userId;
      if (approvedLastWorkingDate) updatePayload['principalApproval.approvedLWD'] = new Date(approvedLastWorkingDate);
    } else if (status === 'HR_APPROVED') {
      updatePayload['hrApproval.status'] = 'APPROVED';
      updatePayload['hrApproval.approvedAt'] = new Date();
      if (actionMetadata?.comments) updatePayload['hrApproval.comments'] = actionMetadata.comments;
      if (actionMetadata?.userId) updatePayload['hrApproval.approvedBy'] = actionMetadata.userId;
    } else if (status === 'FINAL_APPROVED' || status === 'ACCEPTED') {
      updatePayload['adminApproval.status'] = 'APPROVED';
      updatePayload['adminApproval.approvedAt'] = new Date();
      if (actionMetadata?.comments) updatePayload['adminApproval.comments'] = actionMetadata.comments;
      if (actionMetadata?.userId) updatePayload['adminApproval.approvedBy'] = actionMetadata.userId;
      if (actionMetadata?.deactivationDate) updatePayload['adminApproval.deactivationDate'] = new Date(actionMetadata.deactivationDate);
      updatePayload['status'] = 'ACCEPTED';
    }

    const resignation = await Resignation.findOneAndUpdate(
      { _id: resignationId, tenantId: this.tid, isDeleted: { $ne: true } },
      updatePayload,
      { new: true }
    );
    if (!resignation) throw new Error('Resignation not found');

    if (status === 'ACCEPTED' || status === 'FINAL_APPROVED') {
      await Employee.findOneAndUpdate(
        { _id: resignation.employeeId },
        { status: 'RESIGNED' }
      );
    } else if (status === 'PRINCIPAL_APPROVED' || status === 'HR_APPROVED') {
      await Employee.findOneAndUpdate(
        { _id: resignation.employeeId },
        { status: 'NOTICE_PERIOD' }
      );
    }

    return resignation;
  }

  async getExitClearances(resignationId: string) {
    return ExitClearance.find({ resignationId: new mongoose.Types.ObjectId(resignationId), tenantId: this.tid })
      .populate('clearedById', 'firstName lastName');
  }

  async updateExitClearance(clearanceId: string, data: any, clearedById: string) {
    return ExitClearance.findOneAndUpdate(
      { _id: clearanceId, tenantId: this.tid },
      { 
        cleared: data.cleared, 
        remarks: data.remarks, 
        pendingDeductionAmount: data.pendingDeductionAmount || 0,
        clearedById: data.cleared ? new mongoose.Types.ObjectId(clearedById) : undefined,
        clearedDate: data.cleared ? new Date() : undefined
      },
      { new: true }
    );
  }

  async calculateFinalSettlement(resignationId: string) {
    const resignation = await Resignation.findOne({ _id: resignationId, tenantId: this.tid });
    if (!resignation) throw new Error('Resignation not found');
    if (resignation.status !== 'ACCEPTED') throw new Error('Resignation must be ACCEPTED first');

    // Get clearances
    const clearances = await ExitClearance.find({ resignationId: resignation._id, tenantId: this.tid });
    const allCleared = clearances.every((c: any) => c.cleared);
    
    if (!allCleared) throw new Error('All departmental clearances must be completed before Final Settlement');
    
    const clearanceDeductions = clearances.reduce((acc: number, curr: any) => acc + (curr.pendingDeductionAmount || 0), 0);
    
    // In a real system, you'd calculate pending salary up to approvedLastWorkingDate
    // For now, mock calculation placeholders
    const finalSalaryAmount = 50000;
    const leaveEncashmentAmount = 0;
    const pendingReimbursements = 0;
    const noticePeriodRecovery = 0;
    const loanRecovery = 0;
    
    const netSettlementAmount = (finalSalaryAmount + leaveEncashmentAmount + pendingReimbursements) - (noticePeriodRecovery + loanRecovery + clearanceDeductions);

    return FinalSettlement.findOneAndUpdate(
      { resignationId: resignation._id, tenantId: this.tid },
      {
        employeeId: resignation.employeeId,
        finalSalaryAmount,
        leaveEncashmentAmount,
        pendingReimbursements,
        noticePeriodRecovery,
        loanRecovery,
        clearanceDeductions,
        netSettlementAmount,
        status: 'DRAFT'
      },
      { upsert: true, new: true }
    );
  }

  async getFinalSettlement(resignationId: string) {
    return FinalSettlement.findOne({ resignationId: new mongoose.Types.ObjectId(resignationId), tenantId: this.tid });
  }

  async approveFinalSettlement(settlementId: string) {
    const settlement = await FinalSettlement.findOneAndUpdate(
      { _id: settlementId, tenantId: this.tid, status: 'DRAFT' },
      { status: 'APPROVED', settlementDate: new Date() },
      { new: true }
    );
    if (!settlement) throw new Error('Settlement not found or not in DRAFT status');
    
    // Auto-update employee status
    await Employee.findOneAndUpdate({ _id: settlement.employeeId }, { status: 'RESIGNED' });
    
    return settlement;
  }
}
