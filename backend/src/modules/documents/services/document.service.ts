import mongoose from 'mongoose';
import DocumentModel, { IDocument } from '../models/Document.model';
import DocumentCategoryModel from '../models/DocumentCategory.model';
import DocumentTypeModel from '../models/DocumentType.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class DocumentService {
  constructor(private tenantId: string | mongoose.Types.ObjectId) {}

  async getDocuments(filters: any) {
    const query: any = { tenantId: this.tenantId };
    
    if (filters.ownerId) query.ownerId = filters.ownerId;
    if (filters.ownerType) query.ownerType = filters.ownerType;
    if (filters.status) query.status = filters.status;
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.documentTypeId) query.documentTypeId = filters.documentTypeId;
    
    return DocumentModel.find(query)
      .populate('categoryId', 'name')
      .populate('documentTypeId', 'name')
      .sort({ createdAt: -1 });
  }

  async getDocumentById(id: string) {
    const doc = await DocumentModel.findOne({ _id: id, tenantId: this.tenantId })
      .populate('categoryId', 'name')
      .populate('documentTypeId', 'name');
      
    if (!doc) throw new NotFoundError('Document not found');
    return doc;
  }

  async uploadDocument(data: any, file: any, userId: string) {
    if (!file && !data.fileUrl) throw new ValidationError('File or file URL is required');

    let branchId = data.branchId;
    if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
      const Branch = require('../../organization/models/Branch.model').default;
      const defaultBranch = await Branch.findOne({ tenantId: this.tenantId });
      branchId = defaultBranch ? defaultBranch._id : this.tenantId;
    }

    let categoryId = data.categoryId;
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      let cat = await DocumentCategoryModel.findOne({ tenantId: this.tenantId });
      if (!cat) {
        cat = await DocumentCategoryModel.create({
          tenantId: this.tenantId,
          name: 'General',
          code: 'GEN'
        });
      }
      categoryId = cat._id;
    }

    let documentTypeId = data.documentTypeId;
    if (!documentTypeId || !mongoose.Types.ObjectId.isValid(documentTypeId)) {
      let dtype = await DocumentTypeModel.findOne({ tenantId: this.tenantId });
      if (!dtype) {
        dtype = await DocumentTypeModel.create({
          tenantId: this.tenantId,
          categoryId,
          name: 'General Document',
          code: 'GEN_DOC',
          allowedFormats: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xlsx', 'txt']
        });
      }
      documentTypeId = dtype._id;
    }

    const fileName = file ? file.filename : (data.fileName || 'document');
    const originalFileName = file ? file.originalname : (data.originalFileName || fileName);
    const mimeType = file ? file.mimetype : (data.mimeType || 'application/octet-stream');
    const fileSize = file ? file.size : (data.fileSize || 0);
    const fileUrl = file ? `/uploads/${file.filename}` : data.fileUrl;

    const newDoc = new DocumentModel({
      tenantId: this.tenantId,
      branchId,
      categoryId,
      documentTypeId,
      title: data.title || originalFileName,
      description: data.description || '',
      fileName,
      originalFileName,
      mimeType,
      fileSize,
      fileUrl,
      ownerType: data.ownerType || 'SCHOOL',
      ownerId: (data.ownerId && mongoose.Types.ObjectId.isValid(data.ownerId)) ? data.ownerId : new mongoose.Types.ObjectId(userId),
      uploadedBy: new mongoose.Types.ObjectId(userId),
      status: 'UPLOADED',
      verificationStatus: 'NOT_REQUIRED',
    });

    return newDoc.save();
  }

  async updateVerificationStatus(id: string, status: 'VERIFIED' | 'REJECTED', userId: string) {
    const doc = await DocumentModel.findOne({ _id: id, tenantId: this.tenantId });
    if (!doc) throw new NotFoundError('Document not found');
    
    doc.verificationStatus = status;
    doc.status = status === 'VERIFIED' ? 'APPROVED' : 'REJECTED';
    
    return doc.save();
  }

  async getCategories() {
    return DocumentCategoryModel.find({ tenantId: this.tenantId, isActive: true });
  }

  async getTypes(categoryId?: string) {
    const query: any = { tenantId: this.tenantId, isActive: true };
    if (categoryId) query.categoryId = categoryId;
    return DocumentTypeModel.find(query);
  }
}
