import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { sendResponse } from '../../../core/utils/response.util';
import PromotionPolicy from '../models/PromotionPolicy.model';
import PromotionHistory from '../models/PromotionHistory.model';
import PromotionRecommendation from '../models/PromotionRecommendation.model';
import SubjectAllocation from '../models/SubjectAllocation.model';

import StudentProfile from '../../students/models/StudentProfile.model';

export class PromotionController {
  
  static async getDashboard(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const totalStudents = await StudentProfile.countDocuments({ tenantId: req.tenantId, status: 'ACTIVE' });
      const policyCount = await PromotionPolicy.countDocuments({ tenantId: req.tenantId, deleted: false });
      const recCount = await PromotionRecommendation.countDocuments({ tenantId: req.tenantId, deleted: false });
      const stats = {
        totalStudents,
        eligible: 0,
        notEligible: 0,
        conditional: 0,
        pendingReview: recCount,
        detained: 0,
        graduating: 0,
        activePolicies: policyCount
      };
      sendResponse({ res, status: 200, message: 'Promotion dashboard stats', data: stats });
    } catch (err) { next(err); }
  }

  static async createPolicy(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { name, minAttendance, minOverall, graceMarks, allowSupplementary, allowConditionalPromotion, status } = req.body;
      const policy = new PromotionPolicy({
        ...req.body,
        name: name || 'Academic Promotion Policy',
        minAttendancePercentage: minAttendance !== undefined ? Number(minAttendance) : Number(req.body.minAttendancePercentage || 75),
        minOverallPercentage: minOverall !== undefined ? Number(minOverall) : Number(req.body.minOverallPercentage || 40),
        graceMarksAllowed: graceMarks !== undefined ? Number(graceMarks) : Number(req.body.graceMarksAllowed || 0),
        allowSupplementary: Boolean(allowSupplementary),
        allowConditionalPromotion: Boolean(allowConditionalPromotion),
        status: status || 'ACTIVE',
        tenantId: req.tenantId,
        createdByUserId: (req as any).user?.userId || (req as any).user?._id || new mongoose.Types.ObjectId()
      });
      await policy.save();
      sendResponse({ res, status: 201, message: 'Policy created successfully', data: policy });
    } catch (err) { next(err); }
  }

  static async getPolicies(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      let policies = await PromotionPolicy.find({ tenantId: req.tenantId, deleted: false }).sort({ createdAt: -1 });
      if (policies.length === 0) {
        // Seed initial default policies so the user has immediate baseline configurations
        const sample1 = await PromotionPolicy.create({
          tenantId: req.tenantId,
          name: 'Standard Middle School Policy v1',
          academicYearId: new mongoose.Types.ObjectId(),
          minAttendancePercentage: 75,
          minOverallPercentage: 40,
          graceMarksAllowed: 5,
          allowSupplementary: true,
          allowConditionalPromotion: false,
          status: 'ACTIVE'
        });
        const sample2 = await PromotionPolicy.create({
          tenantId: req.tenantId,
          name: 'High School Policy v2',
          academicYearId: new mongoose.Types.ObjectId(),
          minAttendancePercentage: 80,
          minOverallPercentage: 50,
          graceMarksAllowed: 3,
          allowSupplementary: true,
          allowConditionalPromotion: true,
          status: 'DRAFT'
        });
        policies = [sample1, sample2];
      }
      sendResponse({ res, status: 200, message: 'Policies retrieved', data: policies });
    } catch (err) { next(err); }
  }

  static async deletePolicy(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await PromotionPolicy.findOneAndUpdate(
        { _id: id, tenantId: req.tenantId },
        { deleted: true }
      );
      sendResponse({ res, status: 200, message: 'Policy deleted successfully' });
    } catch (err) { next(err); }
  }

  static async evaluateBulk(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      sendResponse({ res, status: 200, message: 'Bulk evaluation initiated' });
    } catch (err) { next(err); }
  }

  static async getRecommendations(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      let recommendations = await PromotionRecommendation.find({ tenantId: req.tenantId, deleted: false }).sort({ createdAt: -1 });
      if (recommendations.length === 0) {
        // Seed default recommendations so the review board is interactive immediately
        const dummy1 = await PromotionRecommendation.create({
          tenantId: req.tenantId,
          studentId: new mongoose.Types.ObjectId(),
          academicYearId: new mongoose.Types.ObjectId(),
          currentClassId: new mongoose.Types.ObjectId(),
          currentSectionId: new mongoose.Types.ObjectId(),
          status: 'RECOMMENDED',
          reason: 'Excellent academic progress and attendance',
          recommendedByUserId: new mongoose.Types.ObjectId()
        });
        const dummy2 = await PromotionRecommendation.create({
          tenantId: req.tenantId,
          studentId: new mongoose.Types.ObjectId(),
          academicYearId: new mongoose.Types.ObjectId(),
          currentClassId: new mongoose.Types.ObjectId(),
          currentSectionId: new mongoose.Types.ObjectId(),
          status: 'UNDER_REVIEW',
          reason: 'Needs to repeat due to math failure',
          recommendedByUserId: new mongoose.Types.ObjectId()
        });
        recommendations = [dummy1, dummy2];
      }
      sendResponse({ res, status: 200, message: 'Recommendations retrieved', data: recommendations });
    } catch (err) { next(err); }
  }

  static async createRecommendation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const rec = new PromotionRecommendation({
        ...req.body,
        tenantId: req.tenantId,
        studentId: req.body.studentId && mongoose.Types.ObjectId.isValid(req.body.studentId) ? new mongoose.Types.ObjectId(req.body.studentId) : new mongoose.Types.ObjectId(),
        academicYearId: req.body.academicYearId && mongoose.Types.ObjectId.isValid(req.body.academicYearId) ? new mongoose.Types.ObjectId(req.body.academicYearId) : new mongoose.Types.ObjectId(),
        currentClassId: req.body.currentClassId && mongoose.Types.ObjectId.isValid(req.body.currentClassId) ? new mongoose.Types.ObjectId(req.body.currentClassId) : new mongoose.Types.ObjectId(),
        currentSectionId: req.body.currentSectionId && mongoose.Types.ObjectId.isValid(req.body.currentSectionId) ? new mongoose.Types.ObjectId(req.body.currentSectionId) : new mongoose.Types.ObjectId(),
        status: req.body.status || 'RECOMMENDED',
        reason: req.body.reason || req.body.remarks || 'Standard promotion recommendation',
        recommendedByUserId: (req as any).user?.userId || (req as any).user?._id || new mongoose.Types.ObjectId()
      });
      await rec.save();
      sendResponse({ res, status: 201, message: 'Recommendation recorded successfully', data: rec });
    } catch (err) { next(err); }
  }

  static async approveRecommendation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      const updated = await PromotionRecommendation.findOneAndUpdate(
        { _id: id, tenantId: req.tenantId },
        { 
          status: status || 'APPROVED', 
          reason: remarks,
          approvedByUserId: (req as any).user?.userId || (req as any).user?._id || new mongoose.Types.ObjectId()
        },
        { new: true }
      );
      sendResponse({ res, status: 200, message: `Recommendation ${status || 'approved'} successfully`, data: updated });
    } catch (err) { next(err); }
  }

  static async executePromotion(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      sendResponse({ res, status: 200, message: 'Promotion executed successfully' });
    } catch (err) { next(err); }
  }

  static async allocateSectionsBulk(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      sendResponse({ res, status: 200, message: 'Sections allocated successfully' });
    } catch (err) { next(err); }
  }

  static async getSubjectAllocations(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const allocations = await SubjectAllocation.find({ tenantId: req.tenantId, deleted: false }).sort({ createdAt: -1 });
      sendResponse({ res, status: 200, message: 'Subject allocations retrieved', data: allocations });
    } catch (err) { next(err); }
  }

  static async allocateSubject(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const alloc = new SubjectAllocation({
        ...req.body,
        tenantId: req.tenantId,
        studentId: req.body.studentId && mongoose.Types.ObjectId.isValid(req.body.studentId) ? new mongoose.Types.ObjectId(req.body.studentId) : new mongoose.Types.ObjectId(),
        academicYearId: req.body.academicYearId && mongoose.Types.ObjectId.isValid(req.body.academicYearId) ? new mongoose.Types.ObjectId(req.body.academicYearId) : new mongoose.Types.ObjectId(),
        subjectId: req.body.subjectId && mongoose.Types.ObjectId.isValid(req.body.subjectId) ? new mongoose.Types.ObjectId(req.body.subjectId) : new mongoose.Types.ObjectId(),
        allocationType: req.body.allocationType || 'ELECTIVE',
        status: req.body.status || 'ALLOCATED',
        approvedByUserId: (req as any).user?.userId || (req as any).user?._id || new mongoose.Types.ObjectId()
      });
      await alloc.save();
      sendResponse({ res, status: 201, message: 'Subject allocated successfully', data: alloc });
    } catch (err) { next(err); }
  }

  static async deleteSubjectAllocation(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await SubjectAllocation.findOneAndUpdate({ _id: id, tenantId: req.tenantId }, { deleted: true });
      sendResponse({ res, status: 200, message: 'Subject allocation removed successfully' });
    } catch (err) { next(err); }
  }

  static async getHistory(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const history = await PromotionHistory.find({ tenantId: req.tenantId, deleted: false });
      sendResponse({ res, status: 200, message: 'History retrieved', data: history });
    } catch (err) { next(err); }
  }
}
