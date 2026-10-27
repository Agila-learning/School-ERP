import { Router } from 'express';
import { ExamController } from '../controllers/exam.controller';
import { AdvancedExamController } from '../controllers/advancedExam.controller';
import { protect } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { requirePermission } from '../../../core/middlewares/auth.middleware';

const router = Router();

router.use(tenantMiddleware, protect);

// Configuration (Types & Terms)
router.post('/types', requirePermission('exam.config.manage'), ExamController.createExamType);
router.get('/types', requirePermission('exam.config.view'), ExamController.getExamTypes);
router.post('/terms', requirePermission('exam.config.manage'), ExamController.createExamTerm);
router.get('/terms', requirePermission('exam.config.view'), ExamController.getExamTerms);
router.post('/grade-systems', requirePermission('exam.config.manage'), ExamController.createGradeSystem);
router.get('/grade-systems', requirePermission('exam.config.view'), ExamController.getGradeSystems);

// Exam Master
router.get('/dashboard', requirePermission('exam.analytics.view'), ExamController.getDashboard);
router.post('/master', requirePermission('exam.create'), ExamController.createExam);
router.get('/master', requirePermission('exam.view'), ExamController.getExams);

// Exam Schedule
router.post('/schedules', requirePermission('exam.schedule.manage'), ExamController.scheduleExam);
router.get('/schedules', requirePermission('exam.schedule.view'), ExamController.getExamSchedule);
router.put('/schedules/:scheduleId', requirePermission('exam.schedule.manage'), ExamController.updateExamSchedule);
router.delete('/schedules/:scheduleId', requirePermission('exam.schedule.manage'), ExamController.deleteExamSchedule);

// Marks Entry
router.post('/marks/sheet', ExamController.getOrCreateMarksSheet);
router.get('/marks/sheet/:sheetId/entries', ExamController.getMarksEntries);
router.post('/marks/sheet/:sheetId/save', ExamController.saveMarks);
router.post('/marks/sheet/:sheetId/lock', ExamController.lockMarksSheet);

// Results & Calculation
router.post('/results/:examinationId/calculate', ExamController.calculateResults);

// Report Cards & Promotions
router.post('/report-cards/generate', ExamController.generateReportCards);
router.post('/promotions/:examinationId/process', ExamController.processPromotions);

// Advanced Results
router.post('/results/:examId/lock', requirePermission('exam.result.lock'), AdvancedExamController.lockResults);
router.post('/results/:examinationId/publish', requirePermission('exam.result.publish'), ExamController.publishResults);
router.get('/results', requirePermission('exam.result.view'), ExamController.getAllResults);
router.get('/results/my-results', ExamController.getMyResults);
router.get('/results/children/:studentId', ExamController.getChildResults);

// Question Bank
router.post('/question-bank', requirePermission('exam.question.manage'), AdvancedExamController.createQuestionBank);
router.get('/question-bank', requirePermission('exam.question.view'), AdvancedExamController.getQuestionBanks);
router.post('/question-bank/:bankId/questions', requirePermission('exam.question.manage'), AdvancedExamController.addQuestion);
router.post('/question-papers/generate', requirePermission('exam.paper.create'), AdvancedExamController.generatePaper);

// Logistics
router.post('/rooms', requirePermission('exam.seating.manage'), AdvancedExamController.addRoom);
router.post('/invigilators/assign', requirePermission('exam.invigilator.manage'), AdvancedExamController.assignInvigilator);
router.post('/seating/generate', requirePermission('exam.seating.manage'), AdvancedExamController.generateSeatingPlan);

// Advanced Assessments
router.post('/revaluation', requirePermission('exam.revaluation.manage'), AdvancedExamController.submitRevaluation);
router.put('/revaluation/:id', requirePermission('exam.revaluation.manage'), AdvancedExamController.processRevaluation);
router.post('/supplementary', requirePermission('exam.supplementary.manage'), AdvancedExamController.createSupplementaryExam);

export default router;
