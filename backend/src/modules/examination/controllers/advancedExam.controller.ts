import { Response } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { QuestionBankService } from '../services/questionBank.service';
import { ExamLogisticsService } from '../services/examLogistics.service';
import { AdvancedAssessmentService } from '../services/advancedAssessment.service';
import { ResultCalculationService } from '../services/resultCalculation.service';
import { sendResponse } from '../../../core/utils/response.util';

export class AdvancedExamController {
  
  // =====================
  // QUESTION BANK
  // =====================
  static async createQuestionBank(req: TenantRequest, res: Response) {
    const bank = await QuestionBankService.createBank(req.tenantId!, req.body);
    sendResponse({ res, status: 201, message: 'Question bank created', data: bank });
  }

  static async getQuestionBanks(req: TenantRequest, res: Response) {
    const banks = await QuestionBankService.getBanks(req.tenantId!, req.query);
    sendResponse({ res, status: 200, message: 'Question banks retrieved', data: banks });
  }

  static async addQuestion(req: TenantRequest, res: Response) {
    const bankId = req.params.bankId as string;
    const question = await QuestionBankService.addQuestion(req.tenantId!, bankId, req.body, req.user!.id);
    sendResponse({ res, status: 201, message: 'Question added', data: question });
  }

  static async generatePaper(req: TenantRequest, res: Response) {
    const paper = await QuestionBankService.createPaperBlueprint(req.tenantId!, req.body.examId, req.body.subjectId, req.body, req.user!.id);
    const generated = await QuestionBankService.generatePaperFromBlueprint(req.tenantId!, paper._id.toString());
    sendResponse({ res, status: 201, message: 'Question paper generated', data: generated });
  }

  // =====================
  // LOGISTICS
  // =====================
  static async addRoom(req: TenantRequest, res: Response) {
    const room = await ExamLogisticsService.addRoom(req.tenantId!, req.body);
    sendResponse({ res, status: 201, message: 'Room added', data: room });
  }

  static async assignInvigilator(req: TenantRequest, res: Response) {
    const assignment = await ExamLogisticsService.assignInvigilator(req.tenantId!, req.body.examId, req.body.scheduleId, req.body.roomId, req.body.staffId, req.body.role);
    sendResponse({ res, status: 201, message: 'Invigilator assigned', data: assignment });
  }

  static async generateSeatingPlan(req: TenantRequest, res: Response) {
    const plans = await ExamLogisticsService.generateSeatingPlan(req.tenantId!, req.body.examId, req.body.scheduleId, req.body.roomIds, req.body.studentIds, req.body.strategy);
    sendResponse({ res, status: 201, message: 'Seating plan generated', data: plans });
  }

  // =====================
  // ADVANCED ASSESSMENTS
  // =====================
  static async submitRevaluation(req: TenantRequest, res: Response) {
    const request = await AdvancedAssessmentService.createRevaluationRequest(req.tenantId!, req.body);
    sendResponse({ res, status: 201, message: 'Revaluation submitted', data: request });
  }

  static async processRevaluation(req: TenantRequest, res: Response) {
    const id = req.params.id as string;
    const request = await AdvancedAssessmentService.processRevaluation(req.tenantId!, id, req.body.status, req.body.revisedMarks, req.user!.id);
    sendResponse({ res, status: 200, message: 'Revaluation processed', data: request });
  }

  static async createSupplementaryExam(req: TenantRequest, res: Response) {
    const exam = await AdvancedAssessmentService.createSupplementaryExam(req.tenantId!, req.body);
    sendResponse({ res, status: 201, message: 'Supplementary exam created', data: exam });
  }

  // =====================
  // RESULT LOCKING
  // =====================
  static async lockResults(req: TenantRequest, res: Response) {
    const examId = req.params.examId as string;
    const service = new ResultCalculationService(req.tenantId!);
    const count = await service.lockResults(examId, req.user!.id);
    sendResponse({ res, status: 200, message: `Locked ${count} results` });
  }
}
