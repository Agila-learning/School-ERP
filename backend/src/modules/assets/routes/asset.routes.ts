import express from 'express';
import { getAssets, createAsset, updateAsset, deleteAsset, getAssetCategories, createAssetCategory, updateAssetCategory, deleteAssetCategory, allocateAsset, returnAsset, transferAsset, createMaintenance, disposeAsset } from '../controllers/asset.controller';
import { protect, requirePermission as checkPermissions } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware as requireTenant } from '../../../core/middlewares/tenant.middleware';

const router = express.Router();

router.use(requireTenant, protect);

router.get('/categories', checkPermissions('asset.view'), getAssetCategories as any);
router.post('/categories', checkPermissions('asset.manage'), createAssetCategory as any);
router.put('/categories/:id', checkPermissions('asset.manage'), updateAssetCategory as any);
router.delete('/categories/:id', checkPermissions('asset.manage'), deleteAssetCategory as any);

router.get('/', checkPermissions('asset.view'), getAssets as any);
router.post('/', checkPermissions('asset.manage'), createAsset as any);
router.put('/:id', checkPermissions('asset.manage'), updateAsset as any);
router.delete('/:id', checkPermissions('asset.manage'), deleteAsset as any);

router.post('/:id/allocate', checkPermissions('asset.allocate'), allocateAsset as any);
router.post('/:id/return', checkPermissions('asset.allocate'), returnAsset as any);
router.post('/:id/transfer', checkPermissions('asset.allocate'), transferAsset as any);
router.post('/:id/maintenance', checkPermissions('asset.maintenance'), createMaintenance as any);
router.post('/:id/dispose', checkPermissions('asset.dispose'), disposeAsset as any);

export default router;
