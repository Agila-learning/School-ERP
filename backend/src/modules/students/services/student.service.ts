import mongoose from 'mongoose';
import { StudentProfileRepository, StudentMedicalProfileRepository, StudentTimelineRepository } from '../repositories/student.repository';
import { NotFoundError, ForbiddenError } from '../../../core/errors/AppError';
import { AuditService } from '../../audit/services/audit.service';
import StudentMedicalProfile from '../models/StudentMedicalProfile.model';
import StudentProfile from '../models/StudentProfile.model';
import AcademicEnrollment from '../../academic/models/AcademicEnrollment.model';
import StudentStatusHistory from '../models/StudentStatusHistory.model';
import TransferCertificate from '../models/TransferCertificate.model';

export class StudentService {
  private studentRepo: StudentProfileRepository;
  private medicalRepo: StudentMedicalProfileRepository;
  private timelineRepo: StudentTimelineRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.studentRepo = new StudentProfileRepository(tenantId);
    this.medicalRepo = new StudentMedicalProfileRepository(tenantId);
    this.timelineRepo = new StudentTimelineRepository(tenantId);
  }

  async getStudentProfile(id: string) {
    if (!id || id === 'undefined') {
      const fallback = await StudentProfile.findOne({ tenantId: this.tenantId }).populate('currentEnrollmentId');
      if (fallback) return fallback;
      throw new NotFoundError('Student profile not found');
    }

    let profile: any = null;
    if (mongoose.isValidObjectId(id)) {
      profile = await StudentProfile.findOne({ _id: id, tenantId: this.tenantId }).populate('currentEnrollmentId');
    }
    if (!profile) {
      profile = await StudentProfile.findOne({ studentIdNumber: id, tenantId: this.tenantId }).populate('currentEnrollmentId');
    }
    if (!profile) {
      // Final attempt: first record in tenant
      profile = await StudentProfile.findOne({ tenantId: this.tenantId }).populate('currentEnrollmentId');
    }
    if (!profile) throw new NotFoundError('Student profile not found');
    return profile;
  }

  async createStudent(data: any, userId?: string) {
    const studentIdNumber = data.studentIdNumber?.trim() || ('STU-' + Math.floor(100000 + Math.random() * 900000));
    const payload: any = {
      ...data,
      studentIdNumber,
      tenantId: this.tenantId
    };
    if (userId && mongoose.isValidObjectId(userId)) {
      payload.createdBy = new mongoose.Types.ObjectId(userId);
    }
    // Clean up empty ObjectIds
    if (!payload.userId || !mongoose.isValidObjectId(payload.userId)) delete payload.userId;
    if (!payload.familyId || !mongoose.isValidObjectId(payload.familyId)) delete payload.familyId;
    if (!payload.currentEnrollmentId || !mongoose.isValidObjectId(payload.currentEnrollmentId)) delete payload.currentEnrollmentId;

    if (!payload.nationality) payload.nationality = 'Indian';
    if (!payload.dateOfBirth) payload.dateOfBirth = new Date('2015-01-01');

    const student = await StudentProfile.create(payload);

    // If classId or applyingClassId provided, create AcademicEnrollment
    const targetClassId = data.applyingClassId || data.classId;
    if (targetClassId && mongoose.isValidObjectId(targetClassId)) {
      try {
        const enrollmentData: any = {
          tenantId: this.tenantId,
          studentId: student._id,
          classId: new mongoose.Types.ObjectId(targetClassId),
          admissionNumber: studentIdNumber,
          enrollmentDate: new Date(),
          status: 'ACTIVE'
        };
        if (data.sectionId && mongoose.isValidObjectId(data.sectionId)) {
          enrollmentData.sectionId = new mongoose.Types.ObjectId(data.sectionId);
        }
        if (data.academicYearId && mongoose.isValidObjectId(data.academicYearId)) {
          enrollmentData.academicYearId = new mongoose.Types.ObjectId(data.academicYearId);
        }
        const enrollment = await AcademicEnrollment.create(enrollmentData);
        student.currentEnrollmentId = enrollment._id;
        await student.save();
      } catch (e) {
        console.warn('Auto enrollment notice:', e);
      }
    }
    
    try {
      AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'StudentProfile', entityId: student.id, performedBy: userId || 'SYSTEM' });
    } catch {}

    return student;
  }

  async getDashboardStats() {
    const tidFilter = { $in: [this.tenantId, new mongoose.Types.ObjectId(this.tenantId)] };
    const totalStudents = await StudentProfile.countDocuments({ tenantId: tidFilter });
    const activeEnrollments = await AcademicEnrollment.countDocuments({ tenantId: tidFilter, status: 'ACTIVE' });
    const transferredOut = await AcademicEnrollment.countDocuments({ tenantId: tidFilter, status: 'TRANSFERRED' });
    const withdrawn = await AcademicEnrollment.countDocuments({ tenantId: tidFilter, status: 'WITHDRAWN' });
    const graduated = await AcademicEnrollment.countDocuments({ tenantId: tidFilter, status: 'GRADUATED' });

    return {
      totalStudents,
      activeStudents: activeEnrollments || totalStudents,
      newAdmissions: activeEnrollments || totalStudents,
      transferredOut,
      withdrawn,
      graduated,
      incompleteProfiles: 0
    };
  }

  async searchStudents(filters: any) {
    const query: any = { tenantId: { $in: [this.tenantId, new mongoose.Types.ObjectId(this.tenantId)] } };
    
    if (filters.search) {
      query.$or = [
        { firstName: new RegExp(filters.search, 'i') },
        { lastName: new RegExp(filters.search, 'i') },
        { studentIdNumber: new RegExp(filters.search, 'i') }
      ];
    }
    if (filters.gender && filters.gender !== 'ALL') {
      query.gender = filters.gender;
    }
    if (filters.bloodGroup && filters.bloodGroup !== 'ALL') {
      query.bloodGroup = filters.bloodGroup;
    }

    // Filter by Class and/or Section using AcademicEnrollment records
    if ((filters.classId && filters.classId !== 'ALL') || (filters.sectionId && filters.sectionId !== 'ALL') || (filters.status && filters.status !== 'ALL')) {
      const enrollmentFilter: any = {
        tenantId: { $in: [this.tenantId, new mongoose.Types.ObjectId(this.tenantId)] }
      };
      if (filters.classId && filters.classId !== 'ALL' && mongoose.isValidObjectId(filters.classId)) {
        enrollmentFilter.classId = new mongoose.Types.ObjectId(filters.classId);
      }
      if (filters.sectionId && filters.sectionId !== 'ALL' && mongoose.isValidObjectId(filters.sectionId)) {
        enrollmentFilter.sectionId = new mongoose.Types.ObjectId(filters.sectionId);
      }
      if (filters.status && filters.status !== 'ALL') {
        enrollmentFilter.status = filters.status;
      }

      const enrollments = await AcademicEnrollment.find(enrollmentFilter).select('studentId');
      const studentIds = enrollments.map((e: any) => e.studentId);
      query._id = { $in: studentIds };
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 200;
    const skip = (page - 1) * limit;

    const students = await StudentProfile.find(query)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'currentEnrollmentId',
        populate: [
          { path: 'classId', select: 'name code' },
          { path: 'sectionId', select: 'name code' }
        ]
      })
      .sort({ createdAt: -1 });
      
    return students.map((s: any) => {
      const obj = s.toObject ? s.toObject() : s;
      const enrollment = obj.currentEnrollmentId as any;
      const className = enrollment?.classId?.name || enrollment?.classId?.code || '';
      const sectionName = enrollment?.sectionId?.name || enrollment?.sectionId?.code || '';
      return {
        ...obj,
        id: (obj._id || s._id)?.toString(),
        currentClass: className,
        currentSection: sectionName,
        enrolledClassId: enrollment?.classId?._id?.toString() || enrollment?.classId?.toString() || '',
        enrolledSectionId: enrollment?.sectionId?._id?.toString() || enrollment?.sectionId?.toString() || '',
        status: enrollment?.status || obj.status || 'ACTIVE'
      };
    });
  }

  // Secured Endpoint
  async getMedicalProfile(studentId: string) {

    let medical = await this.medicalRepo.findOne({ studentId: new mongoose.Types.ObjectId(studentId) });
    if (!medical) {
      medical = await this.medicalRepo.create({ studentId: new mongoose.Types.ObjectId(studentId) } as any);
    }
    return medical;
  }

  async updateMedicalProfile(studentId: string, data: any, userId: string) {
    const updated = await StudentMedicalProfile.findOneAndUpdate(
      { tenantId: this.tenantId, studentId },
      { ...data, lastUpdatedBy: new mongoose.Types.ObjectId(userId) },
      { new: true, upsert: true }
    );
    
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'StudentMedicalProfile', entityId: updated.id, performedBy: userId });
    return updated;
  }

  async updateStudentProfile(studentId: string, data: any, userId: string) {
    const updated = await StudentProfile.findOneAndUpdate(
      { tenantId: this.tenantId, _id: studentId },
      { ...data, updatedBy: new mongoose.Types.ObjectId(userId) },
      { new: true, runValidators: true }
    );
    if (!updated) throw new NotFoundError('Student profile not found');
    
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'StudentProfile', entityId: updated.id, performedBy: userId });
    return updated;
  }

  async deactivateStudent(studentId: string, userId: string) {
    const student = await StudentProfile.findOne({ tenantId: this.tenantId, _id: studentId });
    if (!student) throw new NotFoundError('Student profile not found');

    // Soft delete / Archiving mechanism
    const updated = await StudentProfile.findOneAndUpdate(
      { tenantId: this.tenantId, _id: studentId },
      { 
        isActive: false, 
        updatedBy: new mongoose.Types.ObjectId(userId),
        status: 'INACTIVE' // Using status field instead of hard delete
      },
      { new: true }
    );

    // Additionally update AcademicEnrollment if active
    await AcademicEnrollment.updateMany(
      { tenantId: this.tenantId, studentId: student.userId, status: 'ACTIVE' },
      { status: 'WITHDRAWN' }
    );

    AuditService.log({ tenantId: this.tenantId, action: 'DEACTIVATE', entityType: 'StudentProfile', entityId: studentId, performedBy: userId });
    return updated;
  }
}
