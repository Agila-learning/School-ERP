import { Router } from 'express';
import { eventsController } from './controllers/events.controller';
import { protect, requirePermission } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(protect as any);

router.post('/', requirePermission('events.create'), eventsController.createEvent.bind(eventsController));
router.get('/', requirePermission('events.view'), eventsController.getEvents.bind(eventsController));
router.post('/:id/approve', requirePermission('events.approve'), eventsController.approveEvent.bind(eventsController));
router.post('/:id/publish', requirePermission('events.publish'), eventsController.publishEvent.bind(eventsController));
router.post('/:id/register', requirePermission('events.manage_participants'), eventsController.registerParticipant.bind(eventsController));

router.get('/stats', requirePermission('events.view'), eventsController.getEventStats.bind(eventsController));

// Competition routes
router.post('/:eventId/competitions', requirePermission('events.manage'), eventsController.createCompetition.bind(eventsController));
router.get('/:eventId/competitions', requirePermission('events.view'), eventsController.getCompetitions.bind(eventsController));
router.post('/competitions/:competitionId/teams', requirePermission('events.manage_participants'), eventsController.registerTeam.bind(eventsController));
router.get('/competitions/:competitionId/teams', requirePermission('events.view'), eventsController.getTeams.bind(eventsController));
router.post('/competitions/:competitionId/scores', requirePermission('events.manage'), eventsController.recordScore.bind(eventsController));
router.get('/competitions/:competitionId/scores', requirePermission('events.view'), eventsController.getScores.bind(eventsController));
export default router;
