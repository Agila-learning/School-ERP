import { Response, NextFunction } from 'express';
import { StaffRequest } from '../../../core/middlewares/staffAuth.middleware';
import Payslip from '../../hr/models/Payslip.model';
import EmployeeReimbursement from '../../hr/models/EmployeeReimbursement.model';
import EmployeeAdvance from '../../hr/models/EmployeeAdvance.model';
import { sendResponse } from '../../../core/utils/response.util';

export const getMyPayslips = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const payslips = await Payslip.find({
      employeeId: req.staff._id,
      tenantId: req.tenantId,
      status: { $ne: 'DRAFT' } // Only show published or paid
    })
    .populate('payrollPeriodId')
    .sort({ createdAt: -1 });

    sendResponse({ res, message: 'Payslips fetched', data: payslips });
  } catch (error) {
    next(error);
  }
};

export const submitReimbursement = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const { expenseType, amount, description, documentUrl } = req.body;
    
    const reimbursement = await EmployeeReimbursement.create({
      tenantId: req.tenantId,
      employeeId: req.staff._id,
      claimDate: new Date(),
      expenseType,
      amount,
      description,
      documentUrl,
      status: 'SUBMITTED'
    });

    sendResponse({ res, status: 201, message: 'Reimbursement submitted', data: reimbursement });
  } catch (error) {
    next(error);
  }
};

export const getMyReimbursements = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const reimbursements = await EmployeeReimbursement.find({
      employeeId: req.staff._id,
      tenantId: req.tenantId
    }).sort({ createdAt: -1 });

    sendResponse({ res, message: 'Reimbursements fetched', data: reimbursements });
  } catch (error) {
    next(error);
  }
};

export const requestAdvance = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, reason } = req.body;
    
    const advance = await EmployeeAdvance.create({
      tenantId: req.tenantId,
      employeeId: req.staff._id,
      requestDate: new Date(),
      amount,
      reason,
      status: 'PENDING',
      outstandingBalance: amount
    });

    sendResponse({ res, status: 201, message: 'Advance requested', data: advance });
  } catch (error) {
    next(error);
  }
};

export const getMyAdvances = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const advances = await EmployeeAdvance.find({
      employeeId: req.staff._id,
      tenantId: req.tenantId
    }).sort({ createdAt: -1 });

    sendResponse({ res, message: 'Advances fetched', data: advances });
  } catch (error) {
    next(error);
  }
};
