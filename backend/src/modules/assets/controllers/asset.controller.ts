import { Request, Response, NextFunction } from 'express';
import Asset from '../models/Asset.model';
import AssetCategory from '../models/AssetCategory.model';
import AssetAllocation from '../models/AssetAllocation.model';
import { AssetService } from '../services/asset.service';
import { sendResponse } from '../../../core/utils/response.util';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';

export const getAssets = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const assets = await Asset.find({ tenantId: req.tenantId })
      .populate('itemId assignedToEmployeeId assignedToDepartmentId branchId');
    sendResponse({ res, message: 'Assets fetched', data: assets });
  } catch (error) {
    next(error);
  }
};

export const createAsset = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const asset = await Asset.create({ ...req.body, tenantId: req.tenantId });
    sendResponse({ res, status: 201, message: 'Asset created', data: asset });
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    sendResponse({ res, message: 'Asset updated', data: asset });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status: 'DISPOSED' },
      { new: true }
    );
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    sendResponse({ res, message: 'Asset deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAssetCategories = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await AssetCategory.find({ tenantId: req.tenantId });
    sendResponse({ res, message: 'Asset Categories fetched', data: categories });
  } catch (error) {
    next(error);
  }
};

export const createAssetCategory = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const category = await AssetCategory.create({ ...req.body, tenantId: req.tenantId });
    sendResponse({ res, status: 201, message: 'Asset Category created', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateAssetCategory = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const category = await AssetCategory.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    sendResponse({ res, message: 'Asset Category updated', data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteAssetCategory = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const category = await AssetCategory.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isActive: false },
      { new: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    sendResponse({ res, message: 'Asset Category deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const allocateAsset = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { allocatedToType, allocatedToEmployeeId, allocatedToDepartmentId, conditionAtAllocation } = req.body;
    
    const asset = await Asset.findOne({ _id: req.params.id, tenantId: req.tenantId, status: 'AVAILABLE' });
    if (!asset) {
      return res.status(400).json({ success: false, message: 'Asset not found or not available' });
    }

    const allocation = await AssetAllocation.create({
      tenantId: req.tenantId,
      assetId: asset._id,
      allocatedToType,
      allocatedToEmployeeId,
      allocatedToDepartmentId,
      conditionAtAllocation,
      issuedBy: req.user?._id
    });

    asset.status = 'ASSIGNED';
    asset.assignedToEmployeeId = allocatedToEmployeeId;
    asset.assignedToDepartmentId = allocatedToDepartmentId;
    await asset.save();

    sendResponse({ res, status: 201, message: 'Asset allocated', data: allocation });
  } catch (error) {
    next(error);
  }
};

export const returnAsset = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const asset = await AssetService.returnAsset(req.params.id as any, req.tenantId as any, req.body.condition);
    sendResponse({ res, message: 'Asset returned successfully', data: asset });
  } catch (error) {
    next(error);
  }
};

export const transferAsset = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const transfer = await AssetService.transferAsset(req.tenantId as any, { ...req.body, assetId: req.params.id }, req.user?._id as any);
    sendResponse({ res, message: 'Asset transferred successfully', data: transfer });
  } catch (error) {
    next(error);
  }
};

export const createMaintenance = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const maintenance = await AssetService.createMaintenanceRecord(req.tenantId as any, { ...req.body, assetId: req.params.id }, req.user?._id as any);
    sendResponse({ res, message: 'Maintenance record created', data: maintenance });
  } catch (error) {
    next(error);
  }
};

export const disposeAsset = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const disposal = await AssetService.disposeAsset(req.tenantId as any, { ...req.body, assetId: req.params.id }, req.user?._id as any);
    sendResponse({ res, message: 'Asset disposal recorded', data: disposal });
  } catch (error) {
    next(error);
  }
};
