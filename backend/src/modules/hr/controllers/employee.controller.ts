import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { EmployeeService } from '../services/employee.service';
import { EmployeeRepository } from '../repositories/hr.repository';
import { sendResponse } from '../../../core/utils/response.util';

export const onboardEmployee = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const employee = await service.onboardEmployee(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Employee onboarded successfully', data: employee });
  } catch (error) {
    next(error);
  }
};

export const getEmployees = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new EmployeeRepository(req.tenantId!);
    const employees = await repo.find({});
    // Exclude sensitive data by default
    sendResponse({ res, status: 200, message: 'Employees fetched', data: employees });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const repo = new EmployeeRepository(req.tenantId!);
    const employee = await repo.findById(req.params.id as string);
    if (!employee) {
      return sendResponse({ res, status: 404, message: 'Employee not found', data: null });
    }
    sendResponse({ res, status: 200, message: 'Employee fetched', data: employee });
  } catch (error) {
    next(error);
  }
};

export const getBankProfile = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const bank = await service.getBankProfile(req.params.id as string);
    sendResponse({ res, status: 200, message: 'Bank profile fetched', data: bank });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const employee = await service.updateEmployee(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, status: 200, message: 'Employee updated successfully', data: employee });
  } catch (error) {
    next(error);
  }
};

export const deactivateEmployee = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const employee = await service.deactivateEmployee(req.params.id as string, req.user.id);
    sendResponse({ res, status: 200, message: 'Employee deactivated successfully', data: employee });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const doc = await service.addDocument(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Document uploaded', data: doc });
  } catch (error) { next(error); }
};

export const getDocuments = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const docs = await service.getDocuments(req.params.id as string);
    sendResponse({ res, status: 200, message: 'Documents fetched', data: docs });
  } catch (error) { next(error); }
};

export const getAllStaffDocuments = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const docs = await service.getAllDocuments(req.query);
    sendResponse({ res, status: 200, message: 'All staff documents fetched', data: docs });
  } catch (error) { next(error); }
};

export const verifyStaffDocument = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const { status, remarks } = req.body;
    const doc = await service.verifyDocument(req.params.id as string, status || 'VERIFIED', req.user.id, remarks);
    sendResponse({ res, status: 200, message: `Document marked as ${status || 'VERIFIED'}`, data: doc });
  } catch (error) { next(error); }
};

export const addQualification = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const qual = await service.addQualification(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Qualification added', data: qual });
  } catch (error) { next(error); }
};

export const getQualifications = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const quals = await service.getQualifications(req.params.id as string);
    sendResponse({ res, status: 200, message: 'Qualifications fetched', data: quals });
  } catch (error) { next(error); }
};

export const addExperience = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const exp = await service.addExperience(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Experience added', data: exp });
  } catch (error) { next(error); }
};

export const getExperience = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new EmployeeService(req.tenantId!);
    const exps = await service.getExperience(req.params.id as string);
    sendResponse({ res, status: 200, message: 'Experience fetched', data: exps });
  } catch (error) { next(error); }
};
