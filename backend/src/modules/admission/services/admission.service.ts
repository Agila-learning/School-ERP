import mongoose from 'mongoose';
import { AdmissionApplicationRepository } from '../repositories/admission.repository';
import { NumberSequenceRepository } from '../../config/repositories/numberSequence.repository';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import { AuditService } from '../../audit/services/audit.service';
import User from '../../auth/models/User.model';
import Family from '../../students/models/Family.model';
import Parent from '../../students/models/Parent.model';
import StudentProfile from '../../students/models/StudentProfile.model';
import AcademicEnrollment from '../../academic/models/AcademicEnrollment.model';
import AdmissionApplication from '../models/AdmissionApplication.model';

export class AdmissionService {
  private applicationRepo: AdmissionApplicationRepository;
  private sequenceRepo: NumberSequenceRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.applicationRepo = new AdmissionApplicationRepository(tenantId);
    this.sequenceRepo = new NumberSequenceRepository(tenantId);
  }

  async submitApplication(data: any) {
    if (!data.branchId || data.branchId === '') {
      const Branch = require('../../organization/models/Branch.model').default;
      const defaultBranch = await Branch.findOne({ tenantId: this.tenantId });
      data.branchId = defaultBranch ? defaultBranch._id : this.tenantId;
    }
    if (!data.academicYearId || data.academicYearId === '') {
      const AcademicYear = require('../../academic/models/AcademicYear.model').default;
      let activeYear = await AcademicYear.findOne({ tenantId: this.tenantId, status: 'active' });
      if (!activeYear) activeYear = await AcademicYear.findOne({ tenantId: this.tenantId });
      data.academicYearId = activeYear ? activeYear._id : this.tenantId;
    }

    // Generate App Number
    const appNumber = await this.sequenceRepo.getNextSequence('APP');
    data.applicationNumber = appNumber;
    data.status = 'SUBMITTED';
    return await this.applicationRepo.create(data);
  }

  async getApplications(skip: number = 0, limit: number = 10, query: any = {}) {
    return this.applicationRepo.find(query, skip, limit);
  }

  /**
   * The core engine that converts an Application into a full Student + Parent + Enrollment ecosystem safely.
   */
  async approveAdmission(applicationId: string, assignedSectionId: string, generatePortalAccess: boolean, userId: string) {
    // Note: Transactions disabled for local dev (requires Replica Set)
    try {
      const application = await AdmissionApplication.findOne({ _id: applicationId, tenantId: this.tenantId });
      if (!application) throw new NotFoundError('Application not found');
      if (application.status === 'ADMITTED') throw new ValidationError('Application is already admitted');

      // 1. Generate core identities
      const studentIdNumber = await this.sequenceRepo.getNextSequence('STU');
      const admissionNumber = await this.sequenceRepo.getNextSequence('ADM');

      // 2. Create User accounts if required (using a dummy password/role for now, typically sent via email)
      let studentUserId = null;
      let parentUserId = null;
      
      if (generatePortalAccess) {
        // In a real system, roles would be fetched dynamically
        const studentUser = new User({
          tenantId: this.tenantId,
          firstName: application.studentDetails.firstName,
          lastName: application.studentDetails.lastName,
          email: `${studentIdNumber}@school.edu`, // Mock auto-email
          roleIds: [], // Would inject 'Student' role ObjectId here
          accountStatus: 'active'
        });
        await studentUser.save();
        studentUserId = studentUser._id;

        if (application.parentDetails.fatherEmail) {
          const parentUser = new User({
            tenantId: this.tenantId,
            firstName: application.parentDetails.fatherName,
            lastName: '',
            email: application.parentDetails.fatherEmail,
            roleIds: [], // Would inject 'Parent' role ObjectId here
            accountStatus: 'active'
          });
          await parentUser.save();
          parentUserId = parentUser._id;
        }
      } else {
        // Fallback: If no portal access, we still need a base User record for identity reference
        // (Assuming User schema requires it)
        const ghostUser = new User({
          tenantId: this.tenantId,
          firstName: application.studentDetails.firstName,
          lastName: application.studentDetails.lastName,
          email: `${studentIdNumber}@system.local`, 
          roleIds: [], 
          accountStatus: 'locked' // Cannot login
        });
        await ghostUser.save();
        studentUserId = ghostUser._id;
      }

      // 3. Create Family & Parent records
      const family = new Family({
        tenantId: this.tenantId,
        familyName: `${application.parentDetails.fatherName} Family`,
      });
      await family.save();

      const fatherNameParts = application.parentDetails.fatherName.split(' ');
      const fFirstName = fatherNameParts[0];
      const fLastName = fatherNameParts.length > 1 ? fatherNameParts.slice(1).join(' ') : '-';

      const father = new Parent({
        tenantId: this.tenantId,
        familyId: family._id,
        userId: parentUserId,
        firstName: fFirstName,
        lastName: fLastName,
        relationship: 'Father',
        mobile: application.parentDetails.fatherMobile,
        email: application.parentDetails.fatherEmail,
        occupation: application.parentDetails.fatherOccupation,
      });
      await father.save();

      family.primaryContactId = father._id as mongoose.Types.ObjectId;
      await family.save();

      // 4. Create Student Profile
      const studentProfile = new StudentProfile({
        tenantId: this.tenantId,
        userId: studentUserId,
        familyId: family._id,
        studentIdNumber,
        firstName: application.studentDetails.firstName,
        middleName: application.studentDetails.middleName,
        lastName: application.studentDetails.lastName,
        dateOfBirth: application.studentDetails.dateOfBirth,
        gender: application.studentDetails.gender,
        bloodGroup: application.studentDetails.bloodGroup,
        nationality: application.studentDetails.nationality,
        category: application.studentDetails.category,
        religion: application.studentDetails.religion,
        motherTongue: application.studentDetails.motherTongue,
        emergencyContacts: [{
          name: application.parentDetails.fatherName,
          relationship: 'Father',
          mobile: application.parentDetails.fatherMobile
        }]
      });
      await studentProfile.save();

      // 5. Create Academic Enrollment
      const enrollment = new AcademicEnrollment({
        tenantId: this.tenantId,
        studentId: studentUserId,
        academicYearId: application.academicYearId,
        classId: application.applyingClassId,
        sectionId: assignedSectionId,
        admissionNumber,
        status: 'ACTIVE'
      });
      await enrollment.save();

      // Link enrollment to profile shortcut
      studentProfile.currentEnrollmentId = enrollment._id as mongoose.Types.ObjectId;
      await studentProfile.save();

      // 6. Update Application Status
      application.status = 'ADMITTED';
      await application.save();

      AuditService.log({ tenantId: this.tenantId, action: 'APPROVE', entityType: 'AdmissionApplication', entityId: applicationId, performedBy: userId, metadata: { studentIdNumber, admissionNumber } });

      return { studentProfile, admissionNumber };
    } catch (error) {
      throw error;
    }
  }
}
