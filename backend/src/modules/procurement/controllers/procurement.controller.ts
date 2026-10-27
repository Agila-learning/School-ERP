import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import PurchaseRequest from '../models/PurchaseRequest.model';
import PurchaseOrder from '../models/PurchaseOrder.model';
import GoodsReceipt from '../models/GoodsReceipt.model';
import { ProcurementService } from '../services/procurement.service';
import { SupplierService } from '../services/supplier.service';
import { sendResponse } from '../../../core/utils/response.util';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';

export const getPurchaseRequests = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const prs = await PurchaseRequest.find({ tenantId: req.tenantId }).populate('requesterId departmentId');
    sendResponse({ res, message: 'Purchase requests fetched', data: prs });
  } catch (error) {
    next(error);
  }
};

export const createPurchaseRequest = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const pr = await PurchaseRequest.create({
      ...req.body,
      tenantId: req.tenantId,
      requesterId: req.user?._id, // Assume populated by auth
      requestNumber: `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`
    });
    sendResponse({ res, status: 201, message: 'Purchase request created', data: pr });
  } catch (error) {
    next(error);
  }
};

export const approvePR = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const pr = await ProcurementService.approvePurchaseRequest(req.params.id as string, new mongoose.Types.ObjectId(req.tenantId as any), req.user?._id);
    sendResponse({ res, message: 'PR Approved', data: pr });
  } catch (error) {
    next(error);
  }
};

export const generatePO = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { vendorId, branchId } = req.body;
    const po = await ProcurementService.convertPRtoPO(req.params.id as string, vendorId, branchId, new mongoose.Types.ObjectId(req.tenantId!), req.user?._id);
    sendResponse({ res, status: 201, message: 'PO Generated', data: po });
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrders = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const pos = await PurchaseOrder.find({ tenantId: req.tenantId }).populate('vendorId branchId');
    sendResponse({ res, message: 'Purchase orders fetched', data: pos });
  } catch (error) {
    next(error);
  }
};

export const receiveGoods = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { warehouseId, receivedItems } = req.body;
    const grn = await ProcurementService.createGoodsReceipt(req.params.id as string, warehouseId, receivedItems, new mongoose.Types.ObjectId(req.tenantId!), req.user?._id as any);
    sendResponse({ res, status: 201, message: 'Goods Received (GRN Created)', data: grn });
  } catch (error) {
    next(error);
  }
};

export const addSupplierDocument = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const doc = await SupplierService.addDocument(new mongoose.Types.ObjectId(req.tenantId!), new mongoose.Types.ObjectId(req.params.vendorId as string), req.body);
    sendResponse({ res, status: 201, message: 'Supplier document added', data: doc });
  } catch (error) {
    next(error);
  }
};

export const updateSupplierStatus = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const vendor = await SupplierService.updateSupplierStatus(new mongoose.Types.ObjectId(req.tenantId!), new mongoose.Types.ObjectId(req.params.vendorId as string), req.body.status);
    sendResponse({ res, message: 'Supplier status updated', data: vendor });
  } catch (error) {
    next(error);
  }
};

// --- Phase 65 Stubs ---

export const getRFQs = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    sendResponse({ res, message: 'RFQs fetched', data: [] });
  } catch (error) {
    next(error);
  }
};

export const createRFQ = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    sendResponse({ res, status: 201, message: 'RFQ created', data: req.body });
  } catch (error) {
    next(error);
  }
};

export const submitQuotation = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    sendResponse({ res, status: 201, message: 'Quotation submitted', data: req.body });
  } catch (error) {
    next(error);
  }
};

export const receiveInvoice = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    sendResponse({ res, status: 201, message: 'Invoice received', data: req.body });
  } catch (error) {
    next(error);
  }
};

export const matchInvoice = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { InvoiceMatchingService } = await import('../services/invoiceMatching.service');
    const invoice = await InvoiceMatchingService.matchInvoice(req.tenantId!, req.params.invoiceId as string);
    sendResponse({ res, message: 'Invoice matching process completed', data: invoice });
  } catch (error) {
    next(error);
  }
};

export const processPurchaseReturn = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    sendResponse({ res, status: 201, message: 'Purchase return initiated', data: req.body });
  } catch (error) {
    next(error);
  }
};
