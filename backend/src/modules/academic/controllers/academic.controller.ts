import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { AcademicService } from '../services/academic.service';
import { sendResponse } from '../../../core/utils/response.util';

export const createAcademicYear = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.createAcademicYear(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Academic Year created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getAcademicYears = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getAcademicYears(req.query);
    sendResponse({ res, message: 'Academic Years fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getAcademicYearById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getAcademicYearById(req.params.id as string);
    sendResponse({ res, message: 'Academic Year fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateAcademicYear = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.updateAcademicYear(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, message: 'Academic Year updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteAcademicYear = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.deleteAcademicYear(req.params.id as string, req.user.id);
    sendResponse({ res, message: 'Academic Year deleted successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const createTerm = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.createTerm(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Term created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getTerms = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getTerms(req.query);
    sendResponse({ res, message: 'Terms fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getTermById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getTermById(req.params.id as string);
    sendResponse({ res, message: 'Term fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateTerm = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.updateTerm(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, message: 'Term updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteTerm = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.deleteTerm(req.params.id as string, req.user.id);
    sendResponse({ res, message: 'Term deleted successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.createClass(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Class created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getClasses = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getClasses(req.query);
    sendResponse({ res, message: 'Classes fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getClassById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getClassById(req.params.id as string);
    sendResponse({ res, message: 'Class fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.updateClass(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, message: 'Class updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.deleteClass(req.params.id as string, req.user.id);
    sendResponse({ res, message: 'Class deleted successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const createSection = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.createSection(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Section created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getSections = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getSections(req.query);
    sendResponse({ res, message: 'Sections fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateSection = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.updateSection(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, message: 'Section updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getSectionById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getSectionById(req.params.id as string);
    sendResponse({ res, message: 'Section fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteSection = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.deleteSection(req.params.id as string, req.user.id);
    sendResponse({ res, message: 'Section deleted successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.createSubject(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Subject created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getSubjects = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getSubjects(req.query);
    sendResponse({ res, message: 'Subjects fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.updateSubject(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, message: 'Subject updated successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getSubjectById(req.params.id as string);
    sendResponse({ res, message: 'Subject fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.deleteSubject(req.params.id as string, req.user.id);
    sendResponse({ res, message: 'Subject deleted successfully', data: result });
  } catch (error) {
    next(error);
  }
};

// --- Teacher Assignments ---
export const assignTeacher = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.assignTeacher(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Teacher assigned successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const getTeacherAssignments = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getTeacherAssignments(req.query);
    sendResponse({ res, message: 'Teacher assignments fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const removeTeacherAssignment = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.removeTeacherAssignment(req.params.id as string, req.user.id);
    sendResponse({ res, message: 'Teacher assignment removed successfully', data: result });
  } catch (error) {
    next(error);
  }
};

// --- PERIOD DEFINITION ---
export const createPeriodDefinition = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.createPeriodDefinition(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Period created successfully', data: result });
  } catch (error) { next(error); }
};

export const getPeriodDefinitions = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getPeriodDefinitions(req.query);
    sendResponse({ res, message: 'Periods fetched successfully', data: result });
  } catch (error) { next(error); }
};

export const updatePeriodDefinition = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.updatePeriodDefinition(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, message: 'Period updated successfully', data: result });
  } catch (error) { next(error); }
};

export const deletePeriodDefinition = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.deletePeriodDefinition(req.params.id as string, req.user.id);
    sendResponse({ res, message: 'Period deleted successfully', data: result });
  } catch (error) { next(error); }
};

// --- CURRICULUM (CLASS-SUBJECT) ---
export const createCurriculum = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const data = { ...req.body, branchId: req.user!.branchId };
    const curriculum = await service.createCurriculum(data, req.user!.id);
    res.status(201).json({ success: true, data: curriculum });
  } catch (error) { next(error); }
};

export const getCurriculums = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getCurriculums(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const removeCurriculum = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    await service.removeCurriculum(req.params.id as string, req.user!.id as string);
    res.status(200).json({ success: true, message: 'Class-Subject mapping removed' });
  } catch (error) { next(error); }
};

// --- CLASS TEACHER ASSIGNMENT ---
export const assignClassTeacher = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const assignment = await service.assignClassTeacher(req.body, req.user!.id);
    res.status(201).json({ success: true, data: assignment });
  } catch (error) { next(error); }
};

export const getClassTeacherAssignments = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getClassTeacherAssignments(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const removeClassTeacherAssignment = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    await service.removeClassTeacherAssignment(req.params.id as string, req.user!.id as string);
    res.status(200).json({ success: true, message: 'Class Teacher assignment removed' });
  } catch (error) { next(error); }
};

// --- ACADEMIC EVENTS (HOLIDAYS) ---
export const createAcademicEvent = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.createAcademicEvent(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Event created successfully', data: result });
  } catch (error) { next(error); }
};

export const getAcademicEvents = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getAcademicEvents(req.query);
    sendResponse({ res, message: 'Events fetched successfully', data: result });
  } catch (error) { next(error); }
};

export const updateAcademicEvent = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.updateAcademicEvent(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, message: 'Event updated successfully', data: result });
  } catch (error) { next(error); }
};

export const deleteAcademicEvent = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.deleteAcademicEvent(req.params.id as string, req.user.id);
    sendResponse({ res, message: 'Event deleted successfully', data: result });
  } catch (error) { next(error); }
};

// --- DASHBOARD STATS ---
export const getDashboardStats = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new AcademicService(req.tenantId!);
    const result = await service.getDashboardStats();
    sendResponse({ res, message: 'Academic dashboard stats fetched successfully', data: result });
  } catch (error) {
    next(error);
  }
};
