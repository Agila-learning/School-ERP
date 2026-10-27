import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { TimetableService } from '../services/timetable.service';
import { SubstitutionService } from '../services/substitution.service';
import { SchedulingEngine } from '../services/schedulingEngine.service';
import { sendResponse } from '../../../core/utils/response.util';

// ── Versions ──
export const createVersion = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const result = await service.createVersion(req.body, req.user.id);
    sendResponse({ res, status: 201, message: 'Timetable version created', data: result });
  } catch (err) { next(err); }
};

export const getVersions = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const result = await service.getVersions(req.query.academicYearId as string, req.query.branchId as string);
    sendResponse({ res, status: 200, message: 'Timetable versions fetched', data: result });
  } catch (err) { next(err); }
};

export const publishVersion = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const result = await service.publishVersion(req.params.id as string, req.user.id);
    sendResponse({ res, status: 200, message: 'Timetable published', data: result });
  } catch (err) { next(err); }
};

export const updateVersion = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const result = await service.updateVersion(req.params.id as string, req.body, req.user.id);
    sendResponse({ res, status: 200, message: 'Timetable version updated', data: result });
  } catch (err) { next(err); }
};

export const deleteVersion = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    await service.deleteVersion(req.params.id as string, req.user.id);
    sendResponse({ res, status: 200, message: 'Timetable version and its entries deleted', data: null });
  } catch (err) { next(err); }
};

// ── Entries ──
export const upsertEntry = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const result = await service.upsertEntry(req.body, req.user.id, req.params.entryId as string | undefined);
    sendResponse({ res, status: 201, message: 'Entry saved', data: result });
  } catch (err) { next(err); }
};

export const getEntries = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const result = await service.getEntries(req.query.versionId as string, req.query);
    sendResponse({ res, status: 200, message: 'Entries fetched', data: result });
  } catch (err) { next(err); }
};

export const deleteEntry = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    await service.deleteEntry(req.params.entryId as string, req.user.id);
    sendResponse({ res, status: 200, message: 'Entry deleted', data: null });
  } catch (err) { next(err); }
};

export const getDashboardStats = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const result = await service.getDashboardStats(req.params.versionId as string);
    sendResponse({ res, status: 200, message: 'Dashboard stats fetched', data: result });
  } catch (err) { next(err); }
};

// ── Timetable Views ──
export const getClassTimetable = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const { sectionId, academicYearId } = req.query as Record<string, string>;
    const result = await service.getClassTimetable(sectionId, academicYearId);
    sendResponse({ res, status: 200, message: 'Class timetable fetched', data: result });
  } catch (err) { next(err); }
};

export const getTeacherTimetable = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const result = await service.getTeacherTimetable(req.params.employeeId as string, req.query.academicYearId as string);
    sendResponse({ res, status: 200, message: 'Teacher timetable fetched', data: result });
  } catch (err) { next(err); }
};

export const getRoomTimetable = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const result = await service.getRoomTimetable(req.params.roomId as string, req.query.academicYearId as string);
    sendResponse({ res, status: 200, message: 'Room timetable fetched', data: result });
  } catch (err) { next(err); }
};

export const getConflicts = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new TimetableService(req.tenantId!);
    const result = await service.getConflicts(req.params.versionId as string);
    sendResponse({ res, status: 200, message: 'Conflicts fetched', data: result });
  } catch (err) { next(err); }
};

// ── Auto-generation ──
export const generateTimetable = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const engine = new SchedulingEngine(req.tenantId!);
    const result = await engine.generate(req.body);
    sendResponse({ res, status: 200, message: 'Auto-generation complete. Review draft before publishing.', data: result });
  } catch (err) { next(err); }
};

// ── Substitution ──
export const createSubstitutionRequests = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new SubstitutionService(req.tenantId!);
    const result = await service.createSubstitutionRequests({ ...req.body, requestedByUserId: req.user.id });
    sendResponse({ res, status: 201, message: 'Substitution requests created', data: result });
  } catch (err) { next(err); }
};

export const assignSubstitute = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new SubstitutionService(req.tenantId!);
    const { substituteEmployeeId } = req.body;
    const result = await service.assignSubstitute(req.params.id as string, substituteEmployeeId, req.user.id);
    sendResponse({ res, status: 200, message: 'Substitute assigned', data: result });
  } catch (err) { next(err); }
};

export const getPendingSubstitutions = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new SubstitutionService(req.tenantId!);
    const result = await service.getPendingRequests(req.query.versionId as string);
    sendResponse({ res, status: 200, message: 'Pending substitutions', data: result });
  } catch (err) { next(err); }
};
