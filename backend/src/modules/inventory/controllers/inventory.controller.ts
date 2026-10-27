import { Request, Response, NextFunction } from 'express';
import Item from '../models/Item.model';
import ItemCategory from '../models/ItemCategory.model';
import Warehouse from '../models/Warehouse.model';
import StockBalance from '../models/StockBalance.model';
import StockMovement from '../models/StockTransaction.model';
import { InventoryService } from '../services/inventory.service';
import { sendResponse } from '../../../core/utils/response.util';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';

export const getItems = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const items = await Item.find({ tenantId: req.tenantId }).populate('categoryId');
    sendResponse({ res, message: 'Items fetched', data: items });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const item = await Item.create({ ...req.body, tenantId: req.tenantId });
    sendResponse({ res, status: 201, message: 'Item created', data: item });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    sendResponse({ res, message: 'Item updated', data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isActive: false },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    sendResponse({ res, message: 'Item deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getWarehouses = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const warehouses = await Warehouse.find({ tenantId: req.tenantId }).populate('branchId managerId');
    sendResponse({ res, message: 'Warehouses fetched', data: warehouses });
  } catch (error) {
    next(error);
  }
};

export const createWarehouse = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const wh = await Warehouse.create({ ...req.body, tenantId: req.tenantId });
    sendResponse({ res, status: 201, message: 'Warehouse created', data: wh });
  } catch (error) {
    next(error);
  }
};

export const updateWarehouse = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const wh = await Warehouse.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!wh) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    sendResponse({ res, message: 'Warehouse updated', data: wh });
  } catch (error) {
    next(error);
  }
};

export const deleteWarehouse = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const wh = await Warehouse.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isActive: false },
      { new: true }
    );
    if (!wh) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    sendResponse({ res, message: 'Warehouse deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await ItemCategory.find({ tenantId: req.tenantId });
    sendResponse({ res, message: 'Categories fetched', data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const category = await ItemCategory.create({ ...req.body, tenantId: req.tenantId });
    sendResponse({ res, status: 201, message: 'Category created', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const category = await ItemCategory.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    sendResponse({ res, message: 'Category updated', data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const category = await ItemCategory.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isActive: false },
      { new: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    sendResponse({ res, message: 'Category deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getStockBalances = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const balances = await StockBalance.find({ tenantId: req.tenantId })
      .populate('itemId warehouseId locationId');
    sendResponse({ res, message: 'Stock balances fetched', data: balances });
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const movements = await StockMovement.find({ tenantId: req.tenantId })
      .populate('itemId warehouseId locationId referenceDocumentId performedBy')
      .sort({ createdAt: -1 });
    sendResponse({ res, message: 'Stock movements fetched', data: movements });
  } catch (error) {
    next(error);
  }
};

export const issueStock = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const issue = await InventoryService.issueStock(req.tenantId as any, req.body, req.user?._id as any);
    sendResponse({ res, status: 201, message: 'Stock issued successfully', data: issue });
  } catch (error) {
    next(error);
  }
};

export const returnStock = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const returnRecord = await InventoryService.returnStock(req.tenantId as any, req.body, req.user?._id as any);
    sendResponse({ res, status: 201, message: 'Stock returned successfully', data: returnRecord });
  } catch (error) {
    next(error);
  }
};

export const transferStock = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const transfer = await InventoryService.transferStock(req.tenantId as any, req.body, req.user?._id as any);
    sendResponse({ res, status: 201, message: 'Stock transfer initiated', data: transfer });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const adjustment = await InventoryService.adjustStock(req.tenantId as any, req.body, req.user?._id as any);
    sendResponse({ res, status: 201, message: 'Stock adjustment completed', data: adjustment });
  } catch (error) {
    next(error);
  }
};
