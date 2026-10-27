import { Request, Response, NextFunction } from 'express';
import Vendor from '../models/Vendor.model';
import { sendResponse } from '../../../core/utils/response.util';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';

export const getVendors = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const vendors = await Vendor.find({ tenantId: req.tenantId }).select('-bankInformation');
    sendResponse({ res, message: 'Vendors fetched', data: vendors });
  } catch (error) {
    next(error);
  }
};

export const createVendor = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const vendor = await Vendor.create({
      ...req.body,
      tenantId: req.tenantId,
      vendorIdString: `VEND-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`
    });
    sendResponse({ res, status: 201, message: 'Vendor created', data: vendor });
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    sendResponse({ res, message: 'Vendor updated', data: vendor });
  } catch (error) {
    next(error);
  }
};

export const deleteVendor = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isActive: false },
      { new: true }
    );
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    sendResponse({ res, message: 'Vendor deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getVendorBankDetails = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    
    sendResponse({ res, message: 'Bank details fetched', data: vendor.bankInformation });
  } catch (error) {
    next(error);
  }
};
