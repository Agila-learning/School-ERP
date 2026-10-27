import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { ExamService } from '../services/exam.service';
import { MarksService } from '../services/marks.service';
import { ResultCalculationService } from '../services/resultCalculation.service';
import { RankingService } from '../services/ranking.service';
import { ReportCardService } from '../services/reportCard.service';
import { PromotionEngine } from '../services/promotion.service';
import { sendResponse } from '../../../core/utils/response.util';

import ExamType from '../models/ExamType.model';
import ExamTerm from '../models/ExamTerm.model';

export class ExamController {
  
  // --- Configuration ---
  static async createExamType(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const type = new ExamType({ ...req.body, tenantId: req.tenantId });
      await type.save();
      sendResponse({ res, status: 201, message: 'Exam Type created', data: type });
    } catch (err) { next(err); }
  }

  static async getExamTypes(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const types = await ExamType.find({ tenantId: req.tenantId, deleted: false });
      sendResponse({ res, status: 200, message: 'Exam Types retrieved', data: types });
    } catch (err) { next(err); }
  }

  static async createExamTerm(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const term = new ExamTerm({ ...req.body, tenantId: req.tenantId });
      await term.save();
      sendResponse({ res, status: 201, message: 'Exam Term created', data: term });
    } catch (err) { next(err); }
  }

  static async getExamTerms(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const terms = await ExamTerm.find({ tenantId: req.tenantId, deleted: false }).populate('academicYearId', 'name');
      sendResponse({ res, status: 200, message: 'Exam Terms retrieved', data: terms });
    } catch (err) { next(err); }
  }

  static async createGradeSystem(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      // Need to import GradeSystem
      const GradeSystem = require('../models/GradeSystem.model').default;
      const gs = new GradeSystem({ ...req.body, tenantId: req.tenantId });
      await gs.save();
      sendResponse({ res, status: 201, message: 'Grade System created', data: gs });
    } catch (err) { next(err); }
  }

  static async getGradeSystems(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const GradeSystem = require('../models/GradeSystem.model').default;
      const systems = await GradeSystem.find({ tenantId: req.tenantId, deleted: false });
      sendResponse({ res, status: 200, message: 'Grade Systems retrieved', data: systems });
    } catch (err) { next(err); }
  }

  // --- Exam Master ---
  static async createExam(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new ExamService(req.tenantId!);
      const result = await service.createExam(req.body, req.user!.id);
      sendResponse({ res, status: 201, message: 'Exam created', data: result });
    } catch (err) { next(err); }
  }

  static async getExams(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new ExamService(req.tenantId!);
      const result = await service.getExams();
      sendResponse({ res, status: 200, message: 'Exams retrieved', data: result });
    } catch (err) { next(err); }
  }

  static async getDashboard(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new ExamService(req.tenantId!);
      const result = await service.getDashboardStats();
      sendResponse({ res, status: 200, message: 'Dashboard stats retrieved', data: result });
    } catch (err) { next(err); }
  }

  // --- Exam Scheduling ---
  static async scheduleExam(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new ExamService(req.tenantId!);
      const result = await service.scheduleExam(req.body);
      sendResponse({ res, status: 201, message: 'Exam scheduled', data: result });
    } catch (err) { next(err); }
  }

  static async getExamSchedule(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { examinationId } = req.query;
      if (!examinationId) {
        return sendResponse({ res, status: 400, message: 'examinationId query parameter is required' });
      }
      const service = new ExamService(req.tenantId!);
      const result = await service.getExamSchedule(examinationId as string);
      sendResponse({ res, status: 200, message: 'Exam schedule retrieved', data: result });
    } catch (err) { next(err); }
  }

  static async updateExamSchedule(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const scheduleId = req.params.scheduleId as string;
      const service = new ExamService(req.tenantId!);
      const result = await service.updateExamSchedule(scheduleId, req.body);
      sendResponse({ res, status: 200, message: 'Exam schedule updated', data: result });
    } catch (err) { next(err); }
  }

  static async deleteExamSchedule(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const scheduleId = req.params.scheduleId as string;
      const service = new ExamService(req.tenantId!);
      await service.deleteExamSchedule(scheduleId, req.user!.id);
      sendResponse({ res, status: 200, message: 'Exam schedule deleted' });
    } catch (err) { next(err); }
  }

  // --- Marks Entry ---
  static async getOrCreateMarksSheet(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { examinationId, sectionId, subjectId, classId } = req.body;
      const service = new MarksService(req.tenantId!);
      const sheet = await service.getOrCreateSheet(examinationId, sectionId, subjectId, classId);
      sendResponse({ res, status: 200, message: 'Marks sheet retrieved', data: sheet });
    } catch (err) { next(err); }
  }

  static async getMarksEntries(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const sheetId = req.params.sheetId as string;
      const service = new MarksService(req.tenantId!);
      const entries = await service.getSheetEntries(sheetId);
      sendResponse({ res, status: 200, message: 'Marks entries retrieved', data: entries });
    } catch (err) { next(err); }
  }

  static async saveMarks(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const sheetId = req.params.sheetId as string;
      const { marksData } = req.body;
      const service = new MarksService(req.tenantId!);
      const result = await service.saveMarks(sheetId, marksData, req.user!.id);
      sendResponse({ res, status: 200, message: 'Marks saved successfully', data: result });
    } catch (err) { next(err); }
  }
  
  static async lockMarksSheet(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const sheetId = req.params.sheetId as string;
      const service = new MarksService(req.tenantId!);
      const result = await service.lockSheet(sheetId, req.user!.id);
      sendResponse({ res, status: 200, message: 'Marks locked successfully', data: result });
    } catch (err) { next(err); }
  }

  // --- Results & Calculation ---
  static async calculateResults(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const examinationId = req.params.examinationId as string;
      const service = new ResultCalculationService(req.tenantId!);
      const result = await service.calculateExamResults(examinationId);
      
      // Auto rank after calculation
      const ranking = new RankingService(req.tenantId!);
      await ranking.calculateRanks(examinationId, 'SECTION'); // default section rank
      
      sendResponse({ res, status: 200, message: 'Results calculated successfully', data: result });
    } catch (err) { next(err); }
  }

  // --- Report Cards & Promotion ---
  static async generateReportCards(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { examinationId, classId } = req.body;
      const service = new ReportCardService(req.tenantId!);
      const result = await service.generateReportCards(examinationId, classId, req.user!.id);
      sendResponse({ res, status: 200, message: 'Report cards generated', data: result });
    } catch (err) { next(err); }
  }
  
  static async processPromotions(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const examinationId = req.params.examinationId as string;
      const service = new PromotionEngine(req.tenantId!);
      const result = await service.processPromotions(examinationId, req.user!.id);
      sendResponse({ res, status: 200, message: 'Promotions processed successfully', data: result });
    } catch (err) { next(err); }
  }

  // --- Publication & Access ---
  static async publishResults(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const examinationId = req.params.examinationId as string;
      const service = new ResultCalculationService(req.tenantId!);
      const result = await service.publishResults(examinationId, req.user!.id);
      sendResponse({ res, status: 200, message: 'Results published successfully and notifications sent', data: result });
    } catch (err) { next(err); }
  }

  static async getMyResults(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new ResultCalculationService(req.tenantId!);
      // Ensure only students can call this
      const isStudent = req.user!.role === 'STUDENT' || (req.user!.roleIds && req.user!.roleIds.some((r: any) => r.name.toUpperCase() === 'STUDENT'));
      if (!isStudent) {
        return sendResponse({ res, status: 403, message: 'Only students can access this endpoint' });
      }
      const results = await service.getStudentResults(req.user!.id);
      sendResponse({ res, status: 200, message: 'Results retrieved', data: results });
    } catch (err) { next(err); }
  }

  static async getAllResults(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { examinationId } = req.query;
      if (!examinationId) return sendResponse({ res, status: 400, message: 'examinationId query parameter is required' });
      const service = new ResultCalculationService(req.tenantId!);
      const results = await service.getAllResults(examinationId as string);
      sendResponse({ res, status: 200, message: 'Results retrieved', data: results });
    } catch (err) { next(err); }
  }

  static async getChildResults(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId as string;
      // RBAC check would ideally verify parent-child mapping here. Assuming middleware or service handles it.
      const service = new ResultCalculationService(req.tenantId!);
      const results = await service.getStudentResults(studentId);
      sendResponse({ res, status: 200, message: 'Child results retrieved', data: results });
    } catch (err) { next(err); }
  }
}
