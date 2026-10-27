import express from 'express';
import { onboardTenant, getTenants, getTenantById, updateTenant, updateTenantStatus } from '../controllers/tenant.controller';
import { protect, restrictTo } from '../../../core/middlewares/auth.middleware';

const router = express.Router();

// Public onboarding endpoint
// In a real SaaS, this might be protected by a SuperAdmin token or a captcha
router.post('/onboard', onboardTenant);

// Protected routes (Super Admin only)
router.use(protect);
router.use(restrictTo('Super Admin'));

router.route('/')
  .get(getTenants);

router.route('/:id')
  .get(getTenantById)
  .put(updateTenant);

router.route('/:id/status')
  .patch(updateTenantStatus);

export default router;
