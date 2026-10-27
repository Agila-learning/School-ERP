import mongoose from 'mongoose';
import ExaminationMaster from '../models/ExaminationMaster.model';
import ExamSchedule from '../models/ExamSchedule.model';
import SubjectResult from '../models/SubjectResult.model';
import StudentResult from '../models/StudentResult.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class ExamService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // --- CRUD Operations ---
  async createExam(data: any, createdByUserId: string) {
    return ExaminationMaster.create({
      ...data,
      tenantId: new mongoose.Types.ObjectId(this.tenantId),
      createdByUserId: new mongoose.Types.ObjectId(createdByUserId),
    });
  }

  async getExams() {
    return ExaminationMaster.find({ tenantId: new mongoose.Types.ObjectId(this.tenantId), isDeleted: { $ne: true } })
        .populate('examTypeId', 'name')
        .populate('gradeSystemId', 'name code')
        .populate('applicableClassIds', 'name');
  }

  async getDashboardStats() {
    const tenantObjId = new mongoose.Types.ObjectId(this.tenantId);
    const totalExams = await ExaminationMaster.countDocuments({ tenantId: tenantObjId, isDeleted: { $ne: true } });
    const ongoingExams = await ExaminationMaster.countDocuments({ tenantId: tenantObjId, status: 'ONGOING', isDeleted: { $ne: true } });
    const completedExams = await ExaminationMaster.countDocuments({ tenantId: tenantObjId, status: 'PUBLISHED', isDeleted: { $ne: true } });
    
    // Pass/Fail aggregation across all published results
    const resultStats = await StudentResult.aggregate([
      { $match: { tenantId: tenantObjId, status: 'PUBLISHED' } },
      { 
        $group: {
          _id: '$resultStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    let passCount = 0;
    let failCount = 0;
    resultStats.forEach((r: any) => {
      if (r._id === 'PASS') passCount = r.count;
      else if (r._id === 'FAIL') failCount = r.count;
    });

    const totalResults = passCount + failCount;
    const passPercentage = totalResults > 0 ? ((passCount / totalResults) * 100).toFixed(1) : '0';

    const recentExams = await ExaminationMaster.find({ tenantId: tenantObjId, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name startDate endDate status');

    const pendingApprovals = await StudentResult.countDocuments({ tenantId: tenantObjId, status: 'CALCULATED' });

    return {
      totalExams,
      ongoingExams,
      completedExams,
      passPercentage: `${passPercentage}%`,
      passCount,
      failCount,
      recentExams,
      pendingApprovals
    };
  }

  async updateExamStatus(examId: string, status: string, userId: string) {
      const exam = await ExaminationMaster.findOne({ _id: examId, tenantId: this.tenantId });
      if (!exam) throw new NotFoundError('Exam not found');
      
      exam.status = status as any;
      if (status === 'SCHEDULED' || status === 'ONGOING' || status === 'COMPLETED') {
         exam.approvedByUserId = new mongoose.Types.ObjectId(userId);
      }
      await exam.save();
      return exam;
  }

  // --- Scheduling ---
  private async checkScheduleConflicts(data: any, scheduleIdToIgnore?: string) {
    const tid = new mongoose.Types.ObjectId(this.tenantId);
    
    // Parse times
    // Assuming startTime and endTime are in "HH:MM" format
    // We can do a string comparison if format is strictly "HH:MM", 
    // but better to ensure they overlap.
    const query: any = {
      tenantId: tid,
      examDate: new Date(data.examDate),
      isDeleted: { $ne: true }
    };

    if (scheduleIdToIgnore) {
      query._id = { $ne: new mongoose.Types.ObjectId(scheduleIdToIgnore) };
    }

    // Find exams on the same date
    const sameDateExams = await ExamSchedule.find(query);

    for (const existing of sameDateExams) {
      // Check time overlap
      // e.g. existing: 10:00-11:00, new: 10:30-11:30
      // overlap if (newStart < existingEnd && newEnd > existingStart)
      const existingStart = existing.startTime;
      const existingEnd = existing.endTime;
      const newStart = data.startTime;
      const newEnd = data.endTime;

      if (newStart < existingEnd && newEnd > existingStart) {
        // There is a time overlap. Check for resource conflicts.
        
        // 1. Same Class/Section
        if (
          existing.classId?.toString() === data.classId?.toString() &&
          (!existing.sectionId || !data.sectionId || existing.sectionId?.toString() === data.sectionId?.toString())
        ) {
          const AppError = require('../../../core/errors/AppError');
          throw new AppError.ConflictError(`Class/Section is already scheduled for another exam during this time.`);
        }

        // 2. Same Teacher (Invigilator)
        if (data.teacherId && existing.teacherId?.toString() === data.teacherId?.toString()) {
          const AppError = require('../../../core/errors/AppError');
          throw new AppError.ConflictError(`Teacher is already assigned as an invigilator for another exam during this time.`);
        }

        // 3. Same Room
        if (data.roomId && existing.roomId?.toString() === data.roomId?.toString()) {
          const AppError = require('../../../core/errors/AppError');
          throw new AppError.ConflictError(`Room is already occupied by another exam during this time.`);
        }
      }
    }
  }

  async scheduleExam(data: any) {
    // Validate dates against ExaminationMaster
    const exam = await ExaminationMaster.findById(data.examinationId);
    if (!exam) throw new NotFoundError('Examination not found');

    const examDate = new Date(data.examDate);
    if (examDate < exam.startDate || examDate > exam.endDate) {
        throw new ValidationError('Exam date must be within the Examination start and end dates');
    }

    if (data.startTime >= data.endTime) {
      throw new ValidationError('End time must be after start time');
    }

    await this.checkScheduleConflicts(data);

    return ExamSchedule.create({
      ...data,
      tenantId: new mongoose.Types.ObjectId(this.tenantId),
    });
  }
  
  async getExamSchedule(examinationId: string) {
      return ExamSchedule.find({ 
          tenantId: new mongoose.Types.ObjectId(this.tenantId), 
          examinationId: new mongoose.Types.ObjectId(examinationId),
          isDeleted: { $ne: true }
      }).populate('roomId', 'name code')
        .populate('classId', 'name')
        .populate('sectionId', 'name')
        .populate('subjectId', 'name');
  }

  async updateExamSchedule(scheduleId: string, data: any) {
    const schedule = await ExamSchedule.findOne({ _id: scheduleId, tenantId: this.tenantId, isDeleted: { $ne: true } });
    if (!schedule) throw new NotFoundError('Exam schedule not found');
    
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      throw new ValidationError('End time must be after start time');
    }

    const checkData = {
      ...schedule.toObject(),
      ...data,
    };
    
    await this.checkScheduleConflicts(checkData, scheduleId);

    Object.assign(schedule, data);
    await schedule.save();
    return schedule;
  }

  async deleteExamSchedule(scheduleId: string, userId: string) {
    const schedule = await ExamSchedule.findOne({ _id: scheduleId, tenantId: this.tenantId, isDeleted: { $ne: true } });
    if (!schedule) throw new NotFoundError('Exam schedule not found');
    await (schedule as any).softDelete(userId);
  }
}
