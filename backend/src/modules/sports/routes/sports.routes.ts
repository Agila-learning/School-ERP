import { Router } from 'express';
import { SportsController } from '../controllers/sports.controller';
import { protect, restrictTo } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = Router();

// Apply auth and tenant middlewares to all routes
router.use(protect);
router.use(tenantMiddleware);

const sportsRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SPORTS_COACH', 'TEACHER'];

// --- Dashboard Stats ---
router.route('/dashboard-stats')
  .get(restrictTo(...sportsRoles), SportsController.getDashboardStats);

// --- Teams ---
router.route('/teams')
  .get(restrictTo(...sportsRoles, 'STUDENT'), SportsController.getTeams)
  .post(restrictTo(...sportsRoles), SportsController.createTeam);

router.route('/teams/:id')
  .patch(restrictTo(...sportsRoles), SportsController.updateTeam)
  .delete(restrictTo(...sportsRoles), SportsController.deleteTeam);

// --- Events ---
router.route('/events')
  .get(restrictTo(...sportsRoles, 'STUDENT', 'PARENT'), SportsController.getEvents)
  .post(restrictTo(...sportsRoles), SportsController.createEvent);

router.route('/events/:id')
  .patch(restrictTo(...sportsRoles), SportsController.updateEvent)
  .delete(restrictTo(...sportsRoles), SportsController.deleteEvent);

// --- Equipment ---
router.route('/equipment')
  .get(restrictTo(...sportsRoles), SportsController.getEquipment)
  .post(restrictTo(...sportsRoles), SportsController.createEquipment);

router.route('/equipment/:id')
  .patch(restrictTo(...sportsRoles), SportsController.updateEquipment)
  .delete(restrictTo(...sportsRoles), SportsController.deleteEquipment);

// --- Practice Sessions ---
router.route('/sessions')
  .get(restrictTo(...sportsRoles, 'STUDENT'), SportsController.getSessions)
  .post(restrictTo(...sportsRoles), SportsController.createSession);

router.route('/sessions/:id')
  .patch(restrictTo(...sportsRoles), SportsController.updateSession)
  .delete(restrictTo(...sportsRoles), SportsController.deleteSession);

export default router;
