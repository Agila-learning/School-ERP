import { Router } from 'express';
import { engagementController } from './controllers/engagement.controller';
import { protect, requirePermission } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(protect as any);

// Houses
router.get('/houses/leaderboard', requirePermission('houses.view'), engagementController.getHouseLeaderboard.bind(engagementController));
router.post('/houses/assign', requirePermission('houses.assign'), engagementController.assignHouse.bind(engagementController));

// Elections
router.post('/elections/:electionId/vote', requirePermission('leadership.voting.manage'), engagementController.castVote.bind(engagementController));
router.post('/elections/:electionId/tally', requirePermission('leadership.results.manage'), engagementController.tallyElection.bind(engagementController));

// Achievements
router.post('/achievements', requirePermission('activities.view'), engagementController.submitAchievement.bind(engagementController));
router.post('/achievements/:id/verify', requirePermission('activities.achievements.manage'), engagementController.verifyAchievement.bind(engagementController));

export default router;
