import { Types } from 'mongoose';
import QuestionBankModel, { IQuestionBank } from '../models/QuestionBank.model';
import QuestionModel, { IQuestion } from '../models/Question.model';
import { QuestionPaper, QuestionPaperItem, IQuestionPaper, IQuestionPaperBlueprint } from '../models/QuestionPaper.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class QuestionBankService {
  
  // =====================
  // QUESTION BANK MGMT
  // =====================
  static async createBank(tenantId: string, data: Partial<IQuestionBank>): Promise<IQuestionBank> {
    const bank = new QuestionBankModel({ ...data, tenantId });
    return await bank.save();
  }

  static async getBanks(tenantId: string, filters: any = {}): Promise<IQuestionBank[]> {
    return await QuestionBankModel.find({ tenantId, isDeleted: false, ...filters }).populate('subjectId gradeId');
  }

  // =====================
  // QUESTION MGMT
  // =====================
  static async addQuestion(tenantId: string, bankId: string, data: Partial<IQuestion>, userId: string): Promise<IQuestion> {
    const bank = await QuestionBankModel.findOne({ _id: bankId, tenantId, isDeleted: false });
    if (!bank) throw new NotFoundError('Question Bank not found');

    const question = new QuestionModel({
      ...data,
      tenantId,
      questionBankId: bankId,
      createdBy: userId
    });
    return await question.save();
  }

  static async getQuestions(tenantId: string, bankId: string, filters: any = {}): Promise<IQuestion[]> {
    return await QuestionModel.find({ tenantId, questionBankId: bankId, isDeleted: false, ...filters });
  }

  // =====================
  // QUESTION PAPER
  // =====================
  static async createPaperBlueprint(tenantId: string, examId: string, subjectId: string, data: Partial<IQuestionPaper>, userId: string): Promise<IQuestionPaper> {
    const paper = new QuestionPaper({
      ...data,
      tenantId,
      examId,
      subjectId,
      createdBy: userId,
      status: 'DRAFT'
    });
    return await paper.save();
  }

  static async generatePaperFromBlueprint(tenantId: string, paperId: string): Promise<IQuestionPaper> {
    const paper = await QuestionPaper.findOne({ _id: paperId, tenantId, isDeleted: false });
    if (!paper) throw new NotFoundError('Question Paper not found');
    if (!paper.blueprint) throw new ValidationError('Blueprint is missing from paper');

    const bp = paper.blueprint as IQuestionPaperBlueprint;
    // We would use an algorithm here to query QuestionModel matching the blueprint distribution
    // For now, we mock the selection by just picking top N questions for the subject
    
    const questions = await QuestionModel.find({ 
      tenantId, 
      isDeleted: false,
      // subjectId: paper.subjectId // Note: Question belongs to Bank, Bank belongs to subject
    }).limit(bp.totalQuestions);

    let order = 1;
    for (const q of questions) {
      const item = new QuestionPaperItem({
        tenantId,
        questionPaperId: paper._id,
        questionId: q._id,
        order: order++
      });
      await item.save();
    }

    paper.status = 'GENERATED';
    return await paper.save();
  }
}
