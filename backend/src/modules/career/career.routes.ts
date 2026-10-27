import { Router } from 'express';
import { careerController } from './controllers/career.controller';
import { protect, requirePermission } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(protect as any);

// Profile
router.get(['/profile', '/profile/:studentId'], requirePermission('career.view'), careerController.getProfile.bind(careerController));

// Counseling
router.post('/counseling/appointments', requirePermission('career.view'), careerController.bookAppointment.bind(careerController));

// Placement
router.post('/jobs/:jobId/apply', requirePermission('career.view'), careerController.applyJob.bind(careerController));

export default router;
