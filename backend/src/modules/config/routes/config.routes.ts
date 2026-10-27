import express from 'express';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { validate } from '../../../core/middlewares/validate.middleware';
import * as Controller from '../controllers/config.controller';
import * as Validator from '../validators/config.validator';

const router = express.Router();

router.use(tenantMiddleware, protect);

// Settings
router.get('/settings', requirePermission('config.settings.view'), Controller.getSettings);
router.post('/settings/bulk', requirePermission('config.settings.manage'), Controller.bulkUpdateSettings);
router.post('/settings', requirePermission('config.settings.manage'), validate(Validator.createSettingSchema), Controller.createSetting);
router.put('/settings/:id', requirePermission('config.settings.manage'), validate(Validator.updateSettingSchema), Controller.updateSetting);

// Master Data
router.get('/master-data', requirePermission('config.masterdata.view'), Controller.getMasterData);
router.post('/master-data', requirePermission('config.masterdata.manage'), validate(Validator.createMasterDataSchema), Controller.createMasterData);

// Feature Flags
router.get('/feature-flags', requirePermission('config.featureflags.view'), Controller.getFeatureFlags);
router.put('/feature-flags/:id/toggle', requirePermission('config.featureflags.manage'), Controller.toggleFeatureFlag);

// Number Sequences
router.get('/number-sequences', requirePermission('config.sequences.view'), Controller.getNumberSequences);
router.post('/number-sequences', requirePermission('config.sequences.manage'), validate(Validator.createNumberSequenceSchema), Controller.createNumberSequence);
router.post('/number-sequences/:type/generate', requirePermission('config.sequences.manage'), Controller.generateNextNumber);

export default router;
