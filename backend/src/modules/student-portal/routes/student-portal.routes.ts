import { Router } from 'express';
import { protect } from '../../../core/middlewares/auth.middleware';
import { 
  getMyProfile, 
  getDashboardSummary,
  getStudentAttendance,
  submitComplaint,
  postChatMessage,
  submitHomework,
  toggleEventRegistration
} from '../controllers/student-portal.controller';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/me', getMyProfile);
router.get('/dashboard', getDashboardSummary);
router.get('/attendance', getStudentAttendance);
router.post('/complaints', submitComplaint);
router.post('/messages', postChatMessage);
router.post('/homework/:id/submit', submitHomework);
router.post('/events/:id/register', toggleEventRegistration);

export default router;
