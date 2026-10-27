import mongoose from 'mongoose';
import LessonPlan from '../models/LessonPlan.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class LessonPlanService {
  private tenantId: mongoose.Types.ObjectId;

  constructor(tenantId: mongoose.Types.ObjectId | string) {
    this.tenantId = new mongoose.Types.ObjectId(tenantId);
  }

  async getLessonPlans(query: any) {
    const filter: any = { tenantId: this.tenantId, isDeleted: false };
    if (query.teacherId) {
      filter.teacherId = mongoose.Types.ObjectId.isValid(query.teacherId)
        ? new mongoose.Types.ObjectId(query.teacherId)
        : query.teacherId;
    }
    if (query.subjectId) {
      filter.subjectId = mongoose.Types.ObjectId.isValid(query.subjectId)
        ? new mongoose.Types.ObjectId(query.subjectId)
        : query.subjectId;
    }
    if (query.classId) {
      filter.classId = mongoose.Types.ObjectId.isValid(query.classId)
        ? new mongoose.Types.ObjectId(query.classId)
        : query.classId;
    }
    if (query.sectionId) {
      filter.sectionId = mongoose.Types.ObjectId.isValid(query.sectionId)
        ? new mongoose.Types.ObjectId(query.sectionId)
        : query.sectionId;
    }
    if (query.status) filter.status = query.status;

    return await LessonPlan.find(filter)
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('teacherId', 'firstName lastName')
      .sort({ weekStartDate: -1 })
      .lean();
  }

  async getLessonPlanById(id: string) {
    const queryId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
    const lp = await LessonPlan.findOne({ _id: queryId, tenantId: this.tenantId, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('teacherId', 'firstName lastName')
      .lean();
    
    if (!lp) throw new NotFoundError('Lesson Plan not found');
    return lp;
  }

  async createLessonPlan(data: any, userId?: string) {
    const payload = { ...data, tenantId: this.tenantId };
    
    // Remove empty strings
    if (!payload.sectionId || payload.sectionId === '') delete payload.sectionId;
    if (!payload.teacherId || payload.teacherId === '') delete payload.teacherId;
    
    const effectiveTeacher = payload.teacherId || userId;
    if (effectiveTeacher) {
      payload.teacherId = mongoose.Types.ObjectId.isValid(effectiveTeacher)
        ? new mongoose.Types.ObjectId(effectiveTeacher)
        : effectiveTeacher;
    }
    
    if (payload.subjectId && mongoose.Types.ObjectId.isValid(payload.subjectId)) {
      payload.subjectId = new mongoose.Types.ObjectId(payload.subjectId);
    }
    if (payload.classId && mongoose.Types.ObjectId.isValid(payload.classId)) {
      payload.classId = new mongoose.Types.ObjectId(payload.classId);
    }
    if (payload.sectionId && mongoose.Types.ObjectId.isValid(payload.sectionId)) {
      payload.sectionId = new mongoose.Types.ObjectId(payload.sectionId);
    }
    
    return await LessonPlan.create(payload);
  }

  async updateLessonPlan(id: string, data: any) {
    const queryId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
    const payload = { ...data };
    if (!payload.sectionId || payload.sectionId === '') delete payload.sectionId;

    const lp = await LessonPlan.findOneAndUpdate(
      { _id: queryId, tenantId: this.tenantId, isDeleted: false },
      payload,
      { new: true }
    );
    if (!lp) throw new NotFoundError('Lesson Plan not found');
    return lp;
  }

  async deleteLessonPlan(id: string) {
    const queryId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
    const lp = await LessonPlan.findOneAndUpdate(
      { _id: queryId, tenantId: this.tenantId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!lp) throw new NotFoundError('Lesson Plan not found');
    return lp;
  }
}
