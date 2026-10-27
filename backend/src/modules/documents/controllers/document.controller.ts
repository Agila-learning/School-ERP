import { Request, Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { DocumentService } from '../services/document.service';
import { sendResponse } from '../../../core/utils/response.util';

export const getDocuments = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new DocumentService(req.tenantId!);
    const documents = await service.getDocuments(req.query);
    sendResponse({ res, status: 200, message: 'Documents fetched successfully', data: documents });
  } catch (error) { next(error); }
};

export const getDocumentById = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new DocumentService(req.tenantId!);
    const document = await service.getDocumentById(req.params.id);
    sendResponse({ res, status: 200, message: 'Document fetched successfully', data: document });
  } catch (error) { next(error); }
};

export const uploadDocument = async (req: TenantRequest | any, res: Response, next: NextFunction) => {
  try {
    const service = new DocumentService(req.tenantId!);
    const file = req.file; // From multer or similar middleware
    const result = await service.uploadDocument(req.body, file, req.user.id);
    sendResponse({ res, status: 201, message: 'Document uploaded successfully', data: result });
  } catch (error) { next(error); }
};

export const approveDocument = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new DocumentService(req.tenantId!);
    const result = await service.updateVerificationStatus(req.params.id, 'VERIFIED', req.user.id);
    sendResponse({ res, status: 200, message: 'Document verified successfully', data: result });
  } catch (error) { next(error); }
};

export const rejectDocument = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new DocumentService(req.tenantId!);
    const result = await service.updateVerificationStatus(req.params.id, 'REJECTED', req.user.id);
    sendResponse({ res, status: 200, message: 'Document rejected successfully', data: result });
  } catch (error) { next(error); }
};

export const getDocumentCategories = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new DocumentService(req.tenantId!);
    const categories = await service.getCategories();
    sendResponse({ res, status: 200, message: 'Categories fetched successfully', data: categories });
  } catch (error) { next(error); }
};

export const getDocumentTypes = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const service = new DocumentService(req.tenantId!);
    const types = await service.getTypes(req.query.categoryId as string);
    sendResponse({ res, status: 200, message: 'Types fetched successfully', data: types });
  } catch (error) { next(error); }
};
