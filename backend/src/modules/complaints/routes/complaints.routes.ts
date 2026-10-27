import { Router } from 'express';
import { ComplaintController } from '../controllers/complaints.controller';
import { protect, restrictTo } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = Router();

router.use(protect, tenantMiddleware);

// Parents/Students/Staff can create and view complaints
router.post('/', restrictTo('Parent', 'Student', 'Admin', 'Super Admin', 'Staff', 'Teacher', 'Principal'), ComplaintController.createComplaint);
router.get('/', restrictTo('Parent', 'Student', 'Admin', 'Super Admin', 'Staff', 'Teacher', 'Principal'), ComplaintController.getComplaints);
router.get('/:id', restrictTo('Parent', 'Student', 'Admin', 'Super Admin', 'Staff', 'Teacher', 'Principal'), ComplaintController.getComplaintById);

// Only Admins can update status/resolution
router.patch('/:id', restrictTo('Admin', 'Super Admin'), ComplaintController.updateComplaint);

export default router;
