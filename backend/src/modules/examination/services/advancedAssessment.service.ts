import { Types } from 'mongoose';
import RevaluationRequestModel, { IRevaluationRequest } from '../models/RevaluationRequest.model';
import { SupplementaryExam, SupplementaryRegistration, ISupplementaryExam, ISupplementaryRegistration } from '../models/SupplementaryExam.model';
import GraceBonusMarkModel, { IGraceBonusMark } from '../models/GraceBonusMark.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class AdvancedAssessmentService {
  
  // =====================
  // REVALUATION
  // =====================
  static async createRevaluationRequest(tenantId: string, data: Partial<IRevaluationRequest>): Promise<IRevaluationRequest> {
    // Ensure no existing pending request for same marks entry
    const existing = await RevaluationRequestModel.findOne({ tenantId, marksEntryId: data.marksEntryId, status: { $in: ['PENDING', 'UNDER_REVIEW'] }, isDeleted: false });
    if (existing) throw new ValidationError('A pending revaluation request already exists for this marks entry');

    const request = new RevaluationRequestModel({ ...data, tenantId });
    return await request.save();
  }

  static async processRevaluation(tenantId: string, requestId: string, status: string, revisedMarks?: number, approvedById?: string): Promise<IRevaluationRequest> {
    const request = await RevaluationRequestModel.findOne({ _id: requestId, tenantId, isDeleted: false });
    if (!request) throw new NotFoundError('Revaluation request not found');

    request.status = status as any;
    if (revisedMarks !== undefined) {
      request.revisedMarks = revisedMarks;
    }
    if (approvedById) {
      request.approvedById = approvedById as any;
    }
    
    // In a real system, if APPROVED, we would also trigger a recalculation of the StudentResult here
    // by calling ResultCalculationService.recalculateResult(tenantId, request.marksEntryId...)

    return await request.save();
  }

  // =====================
  // SUPPLEMENTARY EXAMS
  // =====================
  static async createSupplementaryExam(tenantId: string, data: Partial<ISupplementaryExam>): Promise<ISupplementaryExam> {
    const exam = new SupplementaryExam({ ...data, tenantId });
    return await exam.save();
  }

  static async registerForSupplementary(tenantId: string, examId: string, studentId: string, subjectId: string): Promise<ISupplementaryRegistration> {
    const registration = new SupplementaryRegistration({
      tenantId,
      supplementaryExamId: examId,
      studentId,
      subjectId
    });
    return await registration.save();
  }

  // =====================
  // GRACE & BONUS MARKS
  // =====================
  static async applyGraceOrBonus(tenantId: string, data: Partial<IGraceBonusMark>): Promise<IGraceBonusMark> {
    const record = new GraceBonusMarkModel({ ...data, tenantId });
    // This creates an auditable trail. 
    // We would also need to update the MarksEntry or StudentResult accordingly.
    return await record.save();
  }
}
