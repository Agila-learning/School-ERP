import express from 'express';
import { 
  getPurchaseRequests, createPurchaseRequest, approvePR, 
  generatePO, getPurchaseOrders, receiveGoods, addSupplierDocument, updateSupplierStatus,
  getRFQs, createRFQ, submitQuotation, receiveInvoice, matchInvoice, processPurchaseReturn
} from '../controllers/procurement.controller';
import { protect, requirePermission as checkPermissions } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware as requireTenant } from '../../../core/middlewares/tenant.middleware';

const router = express.Router();

router.use(requireTenant, protect);

router.get('/requests', checkPermissions('purchase.view'), getPurchaseRequests as any);
router.post('/requests', checkPermissions('purchase.manage'), createPurchaseRequest as any);
router.post('/requests/:id/approve', checkPermissions('purchase.approve'), approvePR as any);
router.post('/requests/:id/generate-po', checkPermissions('purchase.manage'), generatePO as any);

router.get('/orders', checkPermissions('purchase.view'), getPurchaseOrders as any);
router.post('/orders/:id/receive', checkPermissions('inventory.stock_in'), receiveGoods as any);

router.post('/suppliers/:vendorId/documents', checkPermissions('supplier.manage'), addSupplierDocument as any);
router.patch('/suppliers/:vendorId/status', checkPermissions('supplier.manage'), updateSupplierStatus as any);

// Phase 65 Routes
router.get('/rfq', checkPermissions('purchase.view'), getRFQs as any);
router.post('/rfq/create', checkPermissions('purchase.manage'), createRFQ as any);
router.post('/rfq/:rfqId/quotations', checkPermissions('purchase.manage'), submitQuotation as any);

router.post('/invoices/receive', checkPermissions('purchase.manage'), receiveInvoice as any);
router.post('/invoices/:invoiceId/match', checkPermissions('purchase.manage'), matchInvoice as any);

router.post('/returns/process', checkPermissions('inventory.stock_out'), processPurchaseReturn as any);

export default router;
