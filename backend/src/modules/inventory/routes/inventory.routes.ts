import express from 'express';
import { getItems, createItem, updateItem, deleteItem, getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getStockBalances, getStockMovements, issueStock, returnStock, transferStock, adjustStock, getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/inventory.controller';
import { protect, requirePermission as checkPermissions } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware as requireTenant } from '../../../core/middlewares/tenant.middleware';

const router = express.Router();

router.use(requireTenant, protect);

router.get('/categories', checkPermissions('inventory.view'), getCategories as any);
router.post('/categories', checkPermissions('inventory.manage'), createCategory as any);
router.put('/categories/:id', checkPermissions('inventory.manage'), updateCategory as any);
router.delete('/categories/:id', checkPermissions('inventory.manage'), deleteCategory as any);

router.get('/items', checkPermissions('inventory.view'), getItems as any);
router.post('/items', checkPermissions('inventory.manage'), createItem as any);
router.put('/items/:id', checkPermissions('inventory.manage'), updateItem as any);
router.delete('/items/:id', checkPermissions('inventory.manage'), deleteItem as any);

router.get('/warehouses', checkPermissions('inventory.view'), getWarehouses as any);
router.post('/warehouses', checkPermissions('inventory.manage'), createWarehouse as any);
router.put('/warehouses/:id', checkPermissions('inventory.manage'), updateWarehouse as any);
router.delete('/warehouses/:id', checkPermissions('inventory.manage'), deleteWarehouse as any);

router.get('/stock-balances', checkPermissions('inventory.view'), getStockBalances as any);
router.get('/stock-movements', checkPermissions('inventory.view'), getStockMovements as any);

router.post('/issue', checkPermissions('inventory.manage'), issueStock as any);
router.post('/return', checkPermissions('inventory.manage'), returnStock as any);
router.post('/transfer', checkPermissions('inventory.manage'), transferStock as any);
router.post('/adjust', checkPermissions('inventory.manage'), adjustStock as any);

export default router;
