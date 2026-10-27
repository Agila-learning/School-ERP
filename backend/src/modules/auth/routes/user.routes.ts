import express from 'express';
import { UserController } from '../controllers/user.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = express.Router();

router.use(tenantMiddleware, protect);

// RBAC: Only those with users.manage permission can access user management
router.get('/', requirePermission('users.view'), UserController.getUsers);
router.get('/roles', requirePermission('users.view'), UserController.getRoles);
router.post('/', requirePermission('users.manage'), UserController.createUser);
router.get('/:id', requirePermission('users.view'), UserController.getUserById);
router.put('/:id', requirePermission('users.manage'), UserController.updateUser);
router.put('/:id/status', requirePermission('users.manage'), UserController.updateUserStatus);
router.put('/:id/roles', requirePermission('users.manage'), UserController.updateUserRoles);
router.delete('/:id', requirePermission('users.manage'), UserController.deactivateUser);

export default router;
