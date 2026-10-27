import express from 'express';
import { onboardEmployee, getEmployees, getEmployeeById, getBankProfile, updateEmployee, deactivateEmployee } from '../controllers/employee.controller';
import { getTeachers, getTeacherById } from '../controllers/teacher.controller';
import { protect, requirePermission, restrictTo } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { validate } from '../../../core/middlewares/validate.middleware';
import * as Validator from '../validators/hr.validator';

import { HRController } from '../controllers/hr.controller';
import { 
  getPayrollPeriods, createPayrollPeriod, runPayrollCalculation, 
  getPayslips, approvePayroll, getSalaryComponents, createSalaryComponent, 
  updateSalaryComponent, deactivateSalaryComponent, getSalaryStructures, 
  createSalaryStructure, deactivateSalaryStructure, getMyPayslips 
} from '../controllers/payroll.controller';

const router = express.Router();

router.use(tenantMiddleware, protect);

// Core Employee Endpoints
router.post('/employees', requirePermission('staff.create'), validate(Validator.onboardEmployeeSchema), onboardEmployee);
router.get('/employees', requirePermission('staff.view'), getEmployees);
router.get('/employees/:id', requirePermission('staff.view'), getEmployeeById);
router.put('/employees/:id', requirePermission('staff.update'), updateEmployee);
router.delete('/employees/:id', requirePermission('staff.delete'), deactivateEmployee);

// Teacher Endpoints
router.get('/teachers', requirePermission('staff.view'), getTeachers);
router.get('/teachers/:id', requirePermission('staff.view'), getTeacherById);

// Employee Documents
import { uploadDocument, getDocuments, getAllStaffDocuments, verifyStaffDocument, addQualification, getQualifications, addExperience, getExperience } from '../controllers/employee.controller';
router.get('/documents', requirePermission('staff.view'), getAllStaffDocuments);
router.patch('/documents/:id/verify', requirePermission('staff.update'), verifyStaffDocument);
router.post('/employees/:id/documents', requirePermission('staff.update'), uploadDocument);
router.get('/employees/:id/documents', requirePermission('staff.view'), getDocuments);

// Employee Qualifications
router.post('/employees/:id/qualifications', requirePermission('staff.update'), addQualification);
router.get('/employees/:id/qualifications', requirePermission('staff.view'), getQualifications);

// Employee Experience
router.post('/employees/:id/experience', requirePermission('staff.update'), addExperience);
router.get('/employees/:id/experience', requirePermission('staff.view'), getExperience);


// Secure Bank Profile Endpoint
router.get('/employees/:id/bank', requirePermission('staff.view'), getBankProfile);

// Self Service
router.get('/my-profile', HRController.getMyProfile);
router.get('/my-payslips', getMyPayslips as any);

// Dashboard Stats
router.get('/dashboard-stats', requirePermission('hr.dashboard.view'), HRController.getDashboardStats);

// Phase 16: HR Master
router.get('/departments', HRController.getDepartments);
router.post('/departments', requirePermission('hr.department.manage'), HRController.createDepartment);
router.put('/departments/:id', requirePermission('hr.department.manage'), HRController.updateDepartment);
router.delete('/departments/:id', requirePermission('hr.department.manage'), HRController.deactivateDepartment);

router.get('/designations', HRController.getDesignations);
router.post('/designations', requirePermission('hr.designation.manage'), HRController.createDesignation);
router.put('/designations/:id', requirePermission('hr.designation.manage'), HRController.updateDesignation);
router.delete('/designations/:id', requirePermission('hr.designation.manage'), HRController.deactivateDesignation);

router.get('/employee-directory', HRController.getEmployees); // Using different path to avoid clash
router.get('/employees/:id/profile', HRController.getEmployeeProfile);

// Phase 16: Recruitment
router.get('/candidates', HRController.getCandidates);
router.post('/candidates', requirePermission('hr.recruitment.manage'), HRController.createCandidate);
router.get('/candidates/:candidateId', HRController.getCandidateById);
router.put('/candidates/:candidateId', requirePermission('hr.recruitment.manage'), HRController.updateCandidate);
router.post('/candidates/:candidateId/offer', requirePermission('hr.recruitment.manage'), HRController.generateOffer);

router.get('/interviews', HRController.getInterviews);
router.post('/interviews', requirePermission('hr.recruitment.manage'), HRController.scheduleInterview);
router.put('/interviews/:interviewId', requirePermission('hr.recruitment.manage'), HRController.updateInterviewFeedback);

// Onboarding
router.get('/onboarding-tasks', HRController.getOnboardingTasks);
router.post('/onboarding-tasks/:employeeId', requirePermission('hr.employee.manage'), HRController.createOnboardingTasks);
router.put('/onboarding-tasks/:taskId', requirePermission('hr.employee.manage'), HRController.updateOnboardingTask);

// Phase 28: Payroll Engine
router.get('/payroll/periods', getPayrollPeriods as any);
router.post('/payroll/periods', requirePermission('hr.payroll.manage'), createPayrollPeriod as any);
router.post('/payroll/periods/:id/calculate', requirePermission('hr.payroll.process'), runPayrollCalculation as any);
router.post('/payroll/periods/:id/approve', requirePermission('hr.payroll.approve'), approvePayroll as any);
router.get('/payroll/payslips', getPayslips as any);

// Salary Components & Structures
router.get('/salary-components', getSalaryComponents as any);
router.post('/salary-components', requirePermission('hr.salary.manage'), createSalaryComponent as any);
router.put('/salary-components/:id', requirePermission('hr.salary.manage'), updateSalaryComponent as any);
router.delete('/salary-components/:id', requirePermission('hr.salary.manage'), deactivateSalaryComponent as any);

router.get('/salary-structures', getSalaryStructures as any);
router.post('/salary-structures', requirePermission('hr.salary.manage'), createSalaryStructure as any);
router.delete('/salary-structures/:id', requirePermission('hr.salary.manage'), deactivateSalaryStructure as any);

// Performance
router.get('/performance/reviews', HRController.getPerformanceReviews);
router.post('/performance/reviews', requirePermission('hr.performance.manage'), HRController.createPerformanceReview);
router.post('/performance/reviews/:reviewId/manager-review', requirePermission('hr.performance.manage'), HRController.submitManagerReview);

// Promotions & Appraisals
router.get('/promotions', requirePermission('staff.view'), HRController.getPromotions);
router.post('/promotions', requirePermission('staff.update'), HRController.nominatePromotion);
router.post('/promotions/:id/review', requirePermission('staff.update'), HRController.reviewPromotion);

// Exit Management
router.get('/resignations', HRController.getResignations);
router.post('/resignations', HRController.submitResignation);
router.put('/resignations/:resignationId/status', HRController.updateResignationStatus);

router.get('/resignations/:resignationId/clearances', HRController.getExitClearances);
router.put('/clearances/:clearanceId', HRController.updateExitClearance);

router.get('/resignations/:resignationId/settlement', HRController.getFinalSettlement);
router.post('/resignations/:resignationId/settlement', requirePermission('hr.payroll.manage'), HRController.calculateFinalSettlement);
router.put('/settlements/:settlementId/approve', requirePermission('hr.payroll.manage'), HRController.approveFinalSettlement);

export default router;
