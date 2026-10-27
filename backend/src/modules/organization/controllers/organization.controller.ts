import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { OrganizationService } from '../services/organization.service';
import { sendResponse } from '../../../core/utils/response.util';

export const createSchool = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const school = await orgService.createSchool(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'School created successfully', data: school });
  } catch (error) {
    next(error);
  }
};

export const getSchools = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await orgService.getSchools(skip, limit);
    sendResponse({ res, message: 'Schools fetched successfully', data: result.data, meta: { total: result.total, skip, limit } });
  } catch (error) {
    next(error);
  }
};



export const createBranch = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const branch = await orgService.createBranch(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Branch created successfully', data: branch });
  } catch (error) {
    next(error);
  }
};

export const getBranches = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await orgService.getBranches(skip, limit);
    sendResponse({ res, message: 'Branches fetched successfully', data: result.data, meta: { total: result.total, skip, limit } });
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const branch = await orgService.updateBranch(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, message: 'Branch updated successfully', data: branch });
  } catch (error) {
    next(error);
  }
};

export const createCampus = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const campus = await orgService.createCampus(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Campus created successfully', data: campus });
  } catch (error) {
    next(error);
  }
};

export const createBuilding = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const building = await orgService.createBuilding(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Building created successfully', data: building });
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const rooms = await orgService.getRooms(req.query.buildingId as string);
    sendResponse({ res, status: 200, message: 'Rooms fetched successfully', data: rooms });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const room = await orgService.createRoom(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Room created successfully', data: room });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const dept = await orgService.createDepartment(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Department created successfully', data: dept });
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await orgService.getDepartments(skip, limit);
    sendResponse({ res, message: 'Departments fetched successfully', data: result.data, meta: { total: result.total, skip, limit } });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const orgService = new OrganizationService(req.tenantId!);
    const dept = await orgService.updateDepartment(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, message: 'Department updated successfully', data: dept });
  } catch (error) {
    next(error);
  }
};
