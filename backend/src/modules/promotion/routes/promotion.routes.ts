import { Router } from 'express';
import { PromotionController } from '../controllers/promotion.controller';
import { RolloverController } from '../controllers/rollover.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = Router();

router.use(tenantMiddleware, protect);

// Config & Dashboard
router.get('/dashboard', requirePermission('promotion.view'), PromotionController.getDashboard);
router.post('/policies', requirePermission('promotion.config'), PromotionController.createPolicy);
router.get('/policies', requirePermission('promotion.view'), PromotionController.getPolicies);
router.delete('/policies/:id', requirePermission('promotion.config'), PromotionController.deletePolicy);

// Eligibility & Execution
router.post('/evaluate/bulk', requirePermission('promotion.evaluate'), PromotionController.evaluateBulk);
router.get('/recommendations', requirePermission('promotion.view'), PromotionController.getRecommendations);
router.post('/recommendations', requirePermission('promotion.view'), PromotionController.createRecommendation);
router.post('/recommendations/:id/approve', requirePermission('promotion.approve'), PromotionController.approveRecommendation);
router.post('/execute/:studentId', requirePermission('promotion.execute'), PromotionController.executePromotion);

// Subject & Section Allocation
router.get('/allocation/subjects', requirePermission('promotion.view'), PromotionController.getSubjectAllocations);
router.post('/allocation/section/bulk', requirePermission('promotion.allocate'), PromotionController.allocateSectionsBulk);
router.post('/allocation/subject', requirePermission('promotion.allocate'), PromotionController.allocateSubject);
router.delete('/allocation/subject/:id', requirePermission('promotion.allocate'), PromotionController.deleteSubjectAllocation);

// History & Rollover
router.get('/history', requirePermission('promotion.view'), PromotionController.getHistory);
router.post('/rollover/validate', requirePermission('promotion.rollover'), RolloverController.validateRollover);
router.post('/rollover/execute', requirePermission('promotion.rollover'), RolloverController.executeRollover);

export default router;
