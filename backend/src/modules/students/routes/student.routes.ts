import express from 'express';
import { getStudentProfile, getDashboardStats, searchStudents, getMedicalProfile, updateMedicalProfile, updateStudentProfile, deactivateStudent, createStudent } from '../controllers/student.controller';
import { StudentLifecycleController } from '../controllers/studentLifecycle.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { validate } from '../../../core/middlewares/validate.middleware';
import * as Validator from '../validators/student.validator';

const router = express.Router();

router.use(tenantMiddleware, protect);

// Dashboards & Search
router.get('/dashboard/stats', requirePermission('students.view'), getDashboardStats);
router.get('/search', requirePermission('students.view'), searchStudents);

// Student Documents CRUD (Office Staff / Office Admin / School Admin / Principal)
import { 
  getStudentDocuments, 
  createStudentDocument, 
  updateStudentDocument, 
  deleteStudentDocument 
} from '../controllers/studentDocument.controller';

router.get('/documents/all', requirePermission('students.view'), getStudentDocuments);
router.post('/documents', requirePermission('students.view'), createStudentDocument);
router.get('/:id/documents', requirePermission('students.view'), getStudentDocuments);
router.post('/:id/documents', requirePermission('students.view'), createStudentDocument);
router.put('/documents/:docId', requirePermission('students.view'), updateStudentDocument);
router.delete('/documents/:docId', requirePermission('students.view'), deleteStudentDocument);

// Core Student Profile
router.post('/', requirePermission('students.manage'), createStudent);
router.get('/:id', requirePermission('students.view'), getStudentProfile);
router.put('/:id', requirePermission('students.manage'), validate(Validator.updateStudentProfileSchema), updateStudentProfile);
router.delete('/:id', requirePermission('students.delete'), deactivateStudent);

// Lifecycle Operations
router.put('/:id/status', requirePermission('students.manage'), StudentLifecycleController.changeStatus);
router.post('/:id/transfer', requirePermission('students.transfer'), StudentLifecycleController.transferStudentOut);
router.post('/:id/tc', requirePermission('students.transfer'), StudentLifecycleController.generateTransferCertificate);
router.post('/:id/graduate', requirePermission('students.manage'), StudentLifecycleController.graduateStudent);

// Strictly Protected Medical Data
router.get('/:id/medical', requirePermission('students.medical.view'), getMedicalProfile);
router.put('/:id/medical', requirePermission('students.medical.manage'), validate(Validator.updateMedicalProfileSchema), updateMedicalProfile);

export default router;
