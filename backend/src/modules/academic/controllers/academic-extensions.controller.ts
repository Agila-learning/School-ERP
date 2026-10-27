import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { AcademicExtensionsService } from '../services/academic-extensions.service';
import { sendResponse } from '../../../core/utils/response.util';

// --- SubjectGroup ---
export const createSubjectGroup = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.createSubjectGroup(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Subject Group created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getSubjectGroups = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.getSubjectGroups(req.query);
    sendResponse({ res, message: 'Subject Groups fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateSubjectGroup = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.updateSubjectGroup(req.params.id, req.body, req.user.id);
    sendResponse({ res, message: 'Subject Group updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteSubjectGroup = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    await service.deleteSubjectGroup(req.params.id, req.user.id);
    sendResponse({ res, message: 'Subject Group deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
};

// --- Syllabus ---
export const createSyllabus = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.createSyllabus(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Syllabus created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getSyllabuses = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.getSyllabuses(req.query);
    sendResponse({ res, message: 'Syllabuses fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateSyllabus = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.updateSyllabus(req.params.id, req.body, req.user.id);
    sendResponse({ res, message: 'Syllabus updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteSyllabus = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    await service.deleteSyllabus(req.params.id, req.user.id);
    sendResponse({ res, message: 'Syllabus deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
};

// --- SyllabusTopic ---
export const createSyllabusTopic = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.createSyllabusTopic(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Syllabus Topic created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getSyllabusTopics = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.getSyllabusTopics(req.query);
    sendResponse({ res, message: 'Syllabus Topics fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateSyllabusTopic = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.updateSyllabusTopic(req.params.id, req.body, req.user.id);
    sendResponse({ res, message: 'Syllabus Topic updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteSyllabusTopic = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    await service.deleteSyllabusTopic(req.params.id, req.user.id);
    sendResponse({ res, message: 'Syllabus Topic deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
};

// --- ClassroomAllocation ---
export const createClassroomAllocation = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.createClassroomAllocation(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Classroom Allocation created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getClassroomAllocations = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.getClassroomAllocations(req.query);
    sendResponse({ res, message: 'Classroom Allocations fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateClassroomAllocation = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.updateClassroomAllocation(req.params.id, req.body, req.user.id);
    sendResponse({ res, message: 'Classroom Allocation updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteClassroomAllocation = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    await service.deleteClassroomAllocation(req.params.id, req.user.id);
    sendResponse({ res, message: 'Classroom Allocation deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
};

// --- TransferRecord ---
export const createTransferRecord = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.createTransferRecord(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Transfer Record created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getTransferRecords = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.getTransferRecords(req.query);
    sendResponse({ res, message: 'Transfer Records fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateTransferRecord = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    const result = await service.updateTransferRecord(req.params.id, req.body, req.user.id);
    sendResponse({ res, message: 'Transfer Record updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteTransferRecord = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicExtensionsService(req.tenantId!);
    await service.deleteTransferRecord(req.params.id, req.user.id);
    sendResponse({ res, message: 'Transfer Record deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
};
