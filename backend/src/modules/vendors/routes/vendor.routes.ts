import express from 'express';
import { getVendors, createVendor, updateVendor, deleteVendor, getVendorBankDetails } from '../controllers/vendor.controller';
import { protect, requirePermission as checkPermissions } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware as requireTenant } from '../../../core/middlewares/tenant.middleware';

const router = express.Router();

router.use(requireTenant, protect);

router.get('/', checkPermissions('supplier.view'), getVendors as any);
router.post('/', checkPermissions('supplier.manage'), createVendor as any);
router.put('/:id', checkPermissions('supplier.manage'), updateVendor as any);
router.delete('/:id', checkPermissions('supplier.manage'), deleteVendor as any);

// Field-level security simulation - restricted endpoint
router.get('/:id/bank', checkPermissions('supplier.bank_view'), getVendorBankDetails as any);

export default router;
