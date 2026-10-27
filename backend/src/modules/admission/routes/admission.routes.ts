import express from 'express';
import { submitApplication, approveApplication, getApplications } from '../controllers/admission.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { validate } from '../../../core/middlewares/validate.middleware';
import * as Validator from '../validators/admission.validator';

const router = express.Router();

router.use(tenantMiddleware, protect);

// Public/Applicant submission (would normally be unprotected, but keeping protected for ERP context)
router.post('/applications', requirePermission('admission.manage'), validate(Validator.createApplicationSchema), submitApplication);
router.get('/applications', requirePermission('admission.view'), getApplications);

// Core Admission Processing
router.post('/applications/approve', requirePermission('admission.manage'), validate(Validator.approveApplicationSchema), approveApplication);

export default router;
