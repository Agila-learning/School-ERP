import express from 'express';
import { getParents, getParentById, createParent, updateParent, createRelationship, deactivateParent, removeRelationship } from '../controllers/parents.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = express.Router();

router.use(tenantMiddleware);
router.use(protect);

router.route('/')
  .get(requirePermission('parents.view'), getParents)
  .post(requirePermission('parents.create'), createParent);

router.route('/:id')
  .get(requirePermission('parents.view'), getParentById)
  .put(requirePermission('parents.update'), updateParent)
  .delete(requirePermission('parents.delete'), deactivateParent);

router.post('/:id/relationships', requirePermission('parents.update'), createRelationship);
router.delete('/:id/relationships/:studentId', requirePermission('parents.update'), removeRelationship);

export default router;
