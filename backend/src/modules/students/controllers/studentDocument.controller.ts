import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import StudentDocument from '../models/StudentDocument.model';
import StudentProfile from '../models/StudentProfile.model';
import { sendResponse } from '../../../core/utils/response.util';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import mongoose from 'mongoose';

// @desc    Get all student documents (with optional filters)
// @route   GET /api/v1/students/documents/all or GET /api/v1/students/:id/documents
// @access  Protected (Office Staff, Office Admin, School Admin, Principal)
export const getStudentDocuments = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const { studentId, documentType, status, search } = req.query;
    const query: any = { tenantId, isDeleted: { $ne: true } };

    const targetStudentId = req.params.id || studentId;
    if (targetStudentId && mongoose.Types.ObjectId.isValid(targetStudentId as string)) {
      query.studentId = targetStudentId;
    }

    if (documentType && documentType !== 'ALL') {
      query.documentType = documentType;
    }

    if (status && status !== 'ALL') {
      query.verificationStatus = status;
    }

    if (search) {
      const regex = new RegExp(String(search), 'i');
      query.$or = [
        { title: regex },
        { fileName: regex },
        { studentName: regex },
        { admissionNo: regex },
        { documentType: regex }
      ];
    }

    const docs = await StudentDocument.find(query)
      .populate('studentId', 'firstName lastName studentIdNumber')
      .populate('verifiedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    sendResponse({
      res,
      status: 200,
      message: 'Student documents fetched successfully',
      data: docs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Store/upload new student document
// @route   POST /api/v1/students/documents or POST /api/v1/students/:id/documents
// @access  Protected (Office Staff, Office Admin, School Admin, Principal)
export const createStudentDocument = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const { 
      studentId, studentName, admissionNo, className,
      documentType, title, fileName, fileSize, fileUrl,
      verificationStatus, remarks, expiryDate
    } = req.body;

    const targetStudentId = req.params.id || studentId;

    if (!documentType) {
      throw new ValidationError('Document type is required');
    }
    if (!fileUrl && !title && !fileName) {
      throw new ValidationError('File details or document title are required');
    }

    let resolvedStudentName = studentName;
    let resolvedAdmissionNo = admissionNo;

    if (targetStudentId && mongoose.Types.ObjectId.isValid(targetStudentId)) {
      const student = await StudentProfile.findOne({ _id: targetStudentId, tenantId });
      if (student) {
        resolvedStudentName = resolvedStudentName || `${student.firstName} ${student.lastName}`;
        resolvedAdmissionNo = resolvedAdmissionNo || student.studentIdNumber;
      }
    }

    const doc = await StudentDocument.create({
      tenantId,
      studentId: targetStudentId && mongoose.Types.ObjectId.isValid(targetStudentId) ? targetStudentId : undefined,
      studentName: resolvedStudentName || 'Student Candidate',
      admissionNo: resolvedAdmissionNo || 'ADM-' + Math.floor(1000 + Math.random() * 9000),
      className: className || 'Unassigned',
      documentType,
      title: title || `${documentType} Document`,
      fileName: fileName || `${documentType.replace(/\s+/g, '_')}.pdf`,
      fileSize: fileSize || '650 KB',
      fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      isVerified: verificationStatus === 'VERIFIED',
      verificationStatus: verificationStatus || 'PENDING',
      verifiedBy: verificationStatus === 'VERIFIED' ? req.user.id : undefined,
      remarks: remarks || '',
      expiryDate: expiryDate ? new Date(expiryDate) : undefined
    });

    sendResponse({
      res,
      status: 201,
      message: 'Student document stored successfully',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student document metadata / verification
// @route   PUT /api/v1/students/documents/:docId
// @access  Protected (Office Staff, Office Admin, School Admin, Principal)
export const updateStudentDocument = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const { docId } = req.params;
    const { documentType, title, fileName, verificationStatus, remarks, expiryDate } = req.body;

    const doc = await StudentDocument.findOne({ _id: docId, tenantId, isDeleted: { $ne: true } });
    if (!doc) {
      throw new NotFoundError('Student document not found');
    }

    if (documentType !== undefined) doc.documentType = documentType;
    if (title !== undefined) doc.title = title;
    if (fileName !== undefined) doc.fileName = fileName;
    if (remarks !== undefined) doc.remarks = remarks;
    if (expiryDate !== undefined) doc.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    
    if (verificationStatus !== undefined) {
      doc.verificationStatus = verificationStatus;
      doc.isVerified = verificationStatus === 'VERIFIED';
      if (verificationStatus === 'VERIFIED') {
        doc.verifiedBy = req.user.id;
      }
    }

    await doc.save();

    sendResponse({
      res,
      status: 200,
      message: 'Student document updated successfully',
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student document
// @route   DELETE /api/v1/students/documents/:docId
// @access  Protected (Office Staff, Office Admin, School Admin, Principal)
export const deleteStudentDocument = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId;
    const { docId } = req.params;

    const doc = await StudentDocument.findOne({ _id: docId, tenantId });
    if (!doc) {
      throw new NotFoundError('Student document not found');
    }

    // Soft delete if plugin is available, otherwise hard delete
    if (typeof (doc as any).softDelete === 'function') {
      await (doc as any).softDelete(req.user.id);
    } else {
      await StudentDocument.deleteOne({ _id: docId });
    }

    sendResponse({
      res,
      status: 200,
      message: 'Student document deleted successfully',
      data: { id: docId }
    });
  } catch (error) {
    next(error);
  }
};
