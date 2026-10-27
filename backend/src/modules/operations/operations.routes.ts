import { Router } from 'express';
import { operationsController } from './controllers/operations.controller';
import { protect, requirePermission } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(protect as any);

router.get('/dashboard', requirePermission('control_center.view'), operationsController.getDashboard.bind(operationsController));
router.post('/tasks', requirePermission('tasks.create'), operationsController.createTask.bind(operationsController));
router.post('/approvals/:requestId/action', requirePermission('approvals.approve'), operationsController.processApproval.bind(operationsController));

export default router;
