import express from 'express';
import { 
  createAcademicYear, getAcademicYears, getAcademicYearById, updateAcademicYear, deleteAcademicYear,
  createTerm, getTerms, getTermById, updateTerm, deleteTerm,
  createClass, getClasses, getClassById, updateClass, deleteClass, 
  createSection, getSections, getSectionById, updateSection, deleteSection,
  createSubject, getSubjects, getSubjectById, updateSubject, deleteSubject,
  assignTeacher, getTeacherAssignments, removeTeacherAssignment,
  getDashboardStats,
  createPeriodDefinition, getPeriodDefinitions, updatePeriodDefinition, deletePeriodDefinition,
  createCurriculum, getCurriculums, removeCurriculum,
  assignClassTeacher, getClassTeacherAssignments, removeClassTeacherAssignment,
  createAcademicEvent, getAcademicEvents, updateAcademicEvent, deleteAcademicEvent
} from '../controllers/academic.controller';
import {
  createSubjectGroup, getSubjectGroups, updateSubjectGroup, deleteSubjectGroup,
  createSyllabus, getSyllabuses, updateSyllabus, deleteSyllabus,
  createSyllabusTopic, getSyllabusTopics, updateSyllabusTopic, deleteSyllabusTopic,
  createClassroomAllocation, getClassroomAllocations, updateClassroomAllocation, deleteClassroomAllocation,
  createTransferRecord, getTransferRecords, updateTransferRecord, deleteTransferRecord
} from '../controllers/academic-extensions.controller';
import { 
  createLessonPlan, getLessonPlans, getLessonPlanById, updateLessonPlan, deleteLessonPlan 
} from '../controllers/lessonPlan.controller';
import { 
  createAssignment, getAssignments, getAssignmentById, updateAssignment, deleteAssignment 
} from '../controllers/assignment.controller';
import { 
  submitAssignment, getSubmissionsByAssignment, evaluateSubmission, getMySubmissions 
} from '../controllers/submission.controller';
import { 
  createLearningMaterial, getLearningMaterials, deleteLearningMaterial 
} from '../controllers/learningMaterial.controller';
import { 
  getTeacherDashboard, getStudentDashboard, getAdminDashboard 
} from '../controllers/lms.controller';
import { enrollStudent, bulkPromote, getEnrollments } from '../controllers/enrollment.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { validate } from '../../../core/middlewares/validate.middleware';
import * as Validator from '../validators/academic.validator';

const router = express.Router();

router.use(tenantMiddleware, protect);

// Academic Configuration (Requires manage permission)
router.post('/academic-years', requirePermission('academic.manage'), validate(Validator.createAcademicYearSchema), createAcademicYear);
router.get('/academic-years', requirePermission('academic.view'), getAcademicYears);
router.get('/academic-years/:id', requirePermission('academic.view'), getAcademicYearById);
router.put('/academic-years/:id', requirePermission('academic.manage'), updateAcademicYear);
router.delete('/academic-years/:id', requirePermission('academic.manage'), deleteAcademicYear);

router.post('/terms', requirePermission('academic.manage'), validate(Validator.createTermSchema), createTerm);
router.get('/terms', requirePermission('academic.view'), getTerms);
router.get('/terms/:id', requirePermission('academic.view'), getTermById);
router.put('/terms/:id', requirePermission('academic.manage'), updateTerm);
router.delete('/terms/:id', requirePermission('academic.manage'), deleteTerm);

router.post('/classes', requirePermission('academic.class.manage'), validate(Validator.createClassSchema), createClass);
router.get('/classes', requirePermission('academic.class.view'), getClasses);
router.get('/classes/:id', requirePermission('academic.class.view'), getClassById);
router.put('/classes/:id', requirePermission('academic.class.manage'), updateClass);
router.delete('/classes/:id', requirePermission('academic.class.manage'), deleteClass);

router.post('/sections', requirePermission('academic.section.manage'), validate(Validator.createSectionSchema), createSection);
router.get('/sections', requirePermission('academic.section.view'), getSections);
router.get('/sections/:id', requirePermission('academic.section.view'), getSectionById);
router.put('/sections/:id', requirePermission('academic.section.manage'), updateSection);
router.delete('/sections/:id', requirePermission('academic.section.manage'), deleteSection);

router.post('/subjects', requirePermission('academic.subject.manage'), validate(Validator.createSubjectSchema), createSubject);
router.get('/subjects', requirePermission('academic.subject.view'), getSubjects);
router.get('/subjects/:id', requirePermission('academic.subject.view'), getSubjectById);
router.put('/subjects/:id', requirePermission('academic.subject.manage'), updateSubject);
router.delete('/subjects/:id', requirePermission('academic.subject.manage'), deleteSubject);

// Teacher Assignments
router.post('/teacher-assignments', requirePermission('academic.teacher.manage'), validate(Validator.createTeacherAssignmentSchema), assignTeacher);
router.get('/teacher-assignments', requirePermission('academic.teacher.view'), getTeacherAssignments);
router.delete('/teacher-assignments/:id', requirePermission('academic.teacher.manage'), removeTeacherAssignment);

// Class Teacher Assignments
router.post('/class-teacher-assignments', requirePermission('academic.teacher.manage'), assignClassTeacher);
router.get('/class-teacher-assignments', requirePermission('academic.teacher.view'), getClassTeacherAssignments);
router.delete('/class-teacher-assignments/:id', requirePermission('academic.teacher.manage'), removeClassTeacherAssignment);

// Curriculums (Class-Subject Mappings)
router.post('/curriculums', requirePermission('academic.subject.manage'), createCurriculum);
router.get('/curriculums', requirePermission('academic.subject.view'), getCurriculums);
router.delete('/curriculums/:id', requirePermission('academic.subject.manage'), removeCurriculum);

// Period Definitions
router.post('/period-definitions', requirePermission('academic.manage'), createPeriodDefinition);
router.get('/period-definitions', requirePermission('academic.view'), getPeriodDefinitions);
router.put('/period-definitions/:id', requirePermission('academic.manage'), updatePeriodDefinition);
router.delete('/period-definitions/:id', requirePermission('academic.manage'), deletePeriodDefinition);

// Academic Events / Holidays
router.post('/events', requirePermission('academic.manage'), createAcademicEvent);
router.get('/events', requirePermission('academic.view'), getAcademicEvents);
router.put('/events/:id', requirePermission('academic.manage'), updateAcademicEvent);
router.delete('/events/:id', requirePermission('academic.manage'), deleteAcademicEvent);

// Subject Groups
router.post('/subject-groups', requirePermission('academic.manage'), createSubjectGroup);
router.get('/subject-groups', requirePermission('academic.view'), getSubjectGroups);
router.put('/subject-groups/:id', requirePermission('academic.manage'), updateSubjectGroup);
router.delete('/subject-groups/:id', requirePermission('academic.manage'), deleteSubjectGroup);

// Syllabus & Topics
router.post('/syllabuses', requirePermission('academic.manage'), createSyllabus);
router.get('/syllabuses', requirePermission('academic.view'), getSyllabuses);
router.put('/syllabuses/:id', requirePermission('academic.manage'), updateSyllabus);
router.delete('/syllabuses/:id', requirePermission('academic.manage'), deleteSyllabus);

router.post('/syllabus-topics', requirePermission('academic.manage'), createSyllabusTopic);
router.get('/syllabus-topics', requirePermission('academic.view'), getSyllabusTopics);
router.put('/syllabus-topics/:id', requirePermission('academic.manage'), updateSyllabusTopic);
router.delete('/syllabus-topics/:id', requirePermission('academic.manage'), deleteSyllabusTopic);

// Classroom Allocations
router.post('/classroom-allocations', requirePermission('academic.manage'), createClassroomAllocation);
router.get('/classroom-allocations', requirePermission('academic.view'), getClassroomAllocations);
router.put('/classroom-allocations/:id', requirePermission('academic.manage'), updateClassroomAllocation);
router.delete('/classroom-allocations/:id', requirePermission('academic.manage'), deleteClassroomAllocation);

// Transfer Records
router.post('/transfer-records', requirePermission('academic.manage'), createTransferRecord);
router.get('/transfer-records', requirePermission('academic.view'), getTransferRecords);
router.put('/transfer-records/:id', requirePermission('academic.manage'), updateTransferRecord);
router.delete('/transfer-records/:id', requirePermission('academic.manage'), deleteTransferRecord);

// --- Lesson Plans ---
// Teachers and Coordinators can create and manage, Principals can view
router.post('/lesson-plans', createLessonPlan);
router.get('/lesson-plans', getLessonPlans); // Basic auth is enough, service handles teacher vs admin scoping
router.get('/lesson-plans/:id', getLessonPlanById);
router.put('/lesson-plans/:id', updateLessonPlan);
router.delete('/lesson-plans/:id', deleteLessonPlan);

// Dashboard Stats
router.get('/dashboard-stats', requirePermission('academic.view'), getDashboardStats);

// Enrollments
router.get('/enrollments', requirePermission('academic.enrollment.view'), getEnrollments);
router.post('/enrollments', requirePermission('academic.enrollment.create'), validate(Validator.enrollStudentSchema), enrollStudent);
router.post('/enrollments/bulk-promote', requirePermission('academic.promotion.create'), validate(Validator.bulkPromoteSchema), bulkPromote);

// Assignments & Submissions (Phase 117 LMS)
router.post('/assignments', requirePermission('academic.homework.manage'), createAssignment);
router.get('/assignments', requirePermission('academic.homework.view'), getAssignments);
router.get('/assignments/:id', requirePermission('academic.homework.view'), getAssignmentById);
router.put('/assignments/:id', requirePermission('academic.homework.manage'), updateAssignment);
router.delete('/assignments/:id', requirePermission('academic.homework.manage'), deleteAssignment);

router.post('/assignments/:assignmentId/submit', submitAssignment);
router.get('/assignments/:assignmentId/submissions', requirePermission('academic.homework.manage'), getSubmissionsByAssignment);
router.put('/submissions/:submissionId/evaluate', requirePermission('academic.homework.manage'), evaluateSubmission);
router.get('/submissions/my', getMySubmissions);

// Learning Materials
router.post('/learning-materials', requirePermission('academic.manage'), createLearningMaterial);
router.get('/learning-materials', requirePermission('academic.view'), getLearningMaterials);
router.delete('/learning-materials/:id', requirePermission('academic.manage'), deleteLearningMaterial);

// LMS Dashboards
router.get('/lms/teacher/dashboard', requirePermission('academic.homework.manage'), getTeacherDashboard);
router.get('/lms/student/dashboard', getStudentDashboard); // Auth enforced by protect, student check in controller
router.get('/lms/admin/dashboard', requirePermission('academic.homework.manage'), getAdminDashboard);

export default router;
