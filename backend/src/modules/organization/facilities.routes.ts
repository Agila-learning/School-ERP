import { Router } from 'express';
import { facilitiesController } from './controllers/Facilities.controller';
import { protect, requirePermission } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(protect as any);
router.post('/bookings', requirePermission('facilities.book'), facilitiesController.createBooking.bind(facilitiesController));

export default router;
