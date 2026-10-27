import { Router } from 'express';
import { alumniController } from './controllers/alumni.controller';
import { protect, requirePermission } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(protect as any);

// Profile
router.post('/convert', requirePermission('alumni.manage'), alumniController.convertStudent.bind(alumniController));
router.get('/directory', requirePermission('alumni.directory.view'), alumniController.getDirectory.bind(alumniController));
router.put('/profile', requirePermission('alumni.profile.edit'), alumniController.updateProfile.bind(alumniController));

// Mentorship
router.get('/mentors', requirePermission('alumni.mentorship.view'), alumniController.getMentors.bind(alumniController));

// Jobs
router.get('/jobs', requirePermission('alumni.jobs.view'), alumniController.getJobs.bind(alumniController));
router.post('/jobs', requirePermission('alumni.jobs.post'), alumniController.postJob.bind(alumniController));

// Events
router.get('/events', requirePermission('alumni.events.view'), alumniController.getEvents.bind(alumniController));

// Fundraising
router.get('/campaigns', requirePermission('alumni.campaigns.view'), alumniController.getCampaigns.bind(alumniController));

export default router;
