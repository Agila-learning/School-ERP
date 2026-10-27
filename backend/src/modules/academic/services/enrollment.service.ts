import mongoose from 'mongoose';
import { AcademicEnrollmentRepository, PromotionRecordRepository, SectionRepository } from '../repositories/academic.repository';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';
import { AuditService } from '../../audit/services/audit.service';
import AcademicEnrollment from '../models/AcademicEnrollment.model';
import PromotionRecord from '../models/PromotionRecord.model';

export class EnrollmentService {
  private enrollmentRepo: AcademicEnrollmentRepository;
  private promotionRepo: PromotionRecordRepository;
  private sectionRepo: SectionRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.enrollmentRepo = new AcademicEnrollmentRepository(tenantId);
    this.promotionRepo = new PromotionRecordRepository(tenantId);
    this.sectionRepo = new SectionRepository(tenantId);
  }

  async getEnrollments(academicYearId: string, sectionId?: string) {
    const filter: any = { tenantId: this.tenantId, academicYearId, status: 'ACTIVE' };
    if (sectionId) filter.sectionId = sectionId;
    
    return AcademicEnrollment.find(filter).populate('studentId', 'firstName lastName admissionNumber rollNumber').lean();
  }

  async enrollStudent(data: any, userId: string) {
    // Check if section capacity is exceeded
    const section = await this.sectionRepo.findById(data.sectionId);
    if (!section) throw new NotFoundError('Section not found');

    const currentEnrollments = await AcademicEnrollment.countDocuments({
      tenantId: this.tenantId,
      academicYearId: data.academicYearId,
      sectionId: data.sectionId,
      status: 'ACTIVE'
    });

    if (section.capacity && currentEnrollments >= section.capacity) {
      throw new ValidationError(`Section capacity (${section.capacity}) exceeded. Please authorize an override.`);
    }

    // Check if already enrolled in this academic year
    const existing = await this.enrollmentRepo.findOne({
      academicYearId: data.academicYearId,
      studentId: data.studentId
    });

    if (existing) {
      throw new ValidationError('Student is already enrolled in this academic year.');
    }

    const enrollment = await this.enrollmentRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'AcademicEnrollment', entityId: enrollment.id, performedBy: userId });
    
    return enrollment;
  }

  async bulkPromote(data: any, userId: string) {
    const { studentIds, currentAcademicYearId, newAcademicYearId, newClassId, newSectionId, remarks } = data;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Verify capacity of the new section
      const section = await this.sectionRepo.findById(newSectionId);
      if (!section) throw new NotFoundError('Target section not found');

      const currentCount = await AcademicEnrollment.countDocuments({
        tenantId: this.tenantId,
        academicYearId: newAcademicYearId,
        sectionId: newSectionId,
        status: 'ACTIVE'
      }).session(session);

      if (section.capacity && currentCount + studentIds.length > section.capacity) {
        throw new ValidationError(`Bulk promotion exceeds target section capacity (${section.capacity})`);
      }

      const results = [];

      // 2. Process each student
      for (const studentId of studentIds) {
        // Find current active enrollment
        const currentEnrollment = await AcademicEnrollment.findOne({
          tenantId: this.tenantId,
          studentId,
          academicYearId: currentAcademicYearId,
          status: 'ACTIVE'
        }).session(session);

        if (!currentEnrollment) {
          throw new ValidationError(`Student ${studentId} does not have an active enrollment in the current academic year.`);
        }

        // Close current enrollment
        currentEnrollment.status = 'PROMOTED';
        await currentEnrollment.save({ session });

        // Create new enrollment
        const newEnrollment = new AcademicEnrollment({
          tenantId: this.tenantId,
          studentId,
          academicYearId: newAcademicYearId,
          classId: newClassId,
          sectionId: newSectionId,
          admissionNumber: currentEnrollment.admissionNumber, // Carried over
          status: 'ACTIVE'
        });
        await newEnrollment.save({ session });

        // Create promotion record
        const promotion = new PromotionRecord({
          tenantId: this.tenantId,
          studentId,
          previousEnrollmentId: currentEnrollment._id,
          newEnrollmentId: newEnrollment._id,
          previousClassId: currentEnrollment.classId,
          newClassId: newClassId,
          type: 'PROMOTED',
          promotedByUserId: userId,
          remarks
        });
        await promotion.save({ session });

        results.push(newEnrollment);
      }

      await session.commitTransaction();
      session.endSession();
      
      AuditService.log({ tenantId: this.tenantId, action: 'BULK_UPDATE', entityType: 'AcademicEnrollment', entityId: 'bulk', performedBy: userId, metadata: { summary: `Promoted ${studentIds.length} students` } });

      return results;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
