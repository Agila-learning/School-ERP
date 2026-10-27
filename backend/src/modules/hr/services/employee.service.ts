import mongoose from 'mongoose';
import { EmployeeRepository, TeacherProfileRepository, EmploymentTimelineRepository, EmployeeBankProfileRepository } from '../repositories/hr.repository';
import { NumberSequenceRepository } from '../../config/repositories/numberSequence.repository';
import { NotFoundError, ForbiddenError } from '../../../core/errors/AppError';
import { AuditService } from '../../audit/services/audit.service';
import User from '../../auth/models/User.model';
import Employee from '../models/Employee.model';
import TeacherProfile from '../models/TeacherProfile.model';
import EmploymentTimeline from '../models/EmploymentTimeline.model';
import Role from '../../auth/models/Role.model';
import EmployeeDocument from '../models/EmployeeDocument.model';
import EmployeeQualification from '../models/EmployeeQualification.model';
import EmployeeExperience from '../models/EmployeeExperience.model';
export class EmployeeService {
  private employeeRepo: EmployeeRepository;
  private timelineRepo: EmploymentTimelineRepository;
  private sequenceRepo: NumberSequenceRepository;
  private bankRepo: EmployeeBankProfileRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.employeeRepo = new EmployeeRepository(tenantId);
    this.timelineRepo = new EmploymentTimelineRepository(tenantId);
    this.sequenceRepo = new NumberSequenceRepository(tenantId);
    this.bankRepo = new EmployeeBankProfileRepository(tenantId);
  }

  async onboardEmployee(data: any, performedByUserId: string) {
    // Note: Transactions disabled for local dev
    try {
      // 1. Generate ID
      const employeeIdNumber = await this.sequenceRepo.getNextSequence('EMP');
      
      // 2. Create User account if requested
      let userId = null;
      if (data.createUserAccount && data.email) {
        const roleName = data.isTeacher ? 'Teacher' : 'Staff';
        const role = await Role.findOne({ name: roleName, tenantId: this.tenantId });
        
        const user = new User({
          tenantId: this.tenantId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password || 'password123',
          roleIds: role ? [role._id] : [], 
          accountStatus: 'active'
        });
        await user.save();
        userId = user._id;
      }

      // 3. Create Employee
      const employee = new Employee({
        ...data,
        tenantId: this.tenantId,
        userId,
        employeeIdNumber,
        status: data.employmentType === 'Probation' ? 'ON_PROBATION' : 'ACTIVE'
      });
      await employee.save();

      // 4. Create Teacher Profile if applicable
      if (data.isTeacher) {
        const teacher = new TeacherProfile({
          tenantId: this.tenantId,
          employeeId: employee._id,
        });
        await teacher.save();
      }

      // 5. Log Timeline Event
      const timeline = new EmploymentTimeline({
        tenantId: this.tenantId,
        employeeId: employee._id,
        eventType: 'ONBOARDING',
        title: 'Employee Onboarded',
        performedByUserId: new mongoose.Types.ObjectId(performedByUserId)
      });
      await timeline.save();

      AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Employee', entityId: employee.id, performedBy: performedByUserId });

      return employee;
    } catch (error) {
      throw error;
    }
  }

  // Secured Endpoint
  async getBankProfile(employeeId: string) {

    const bank = await this.bankRepo.findOne({ employeeId: new mongoose.Types.ObjectId(employeeId) });
    if (!bank) throw new NotFoundError('Bank profile not found for this employee');
    return bank;
  }

  async updateEmployee(employeeId: string, data: any, userId: string) {
    const updated = await Employee.findOneAndUpdate(
      { tenantId: this.tenantId, _id: employeeId },
      { ...data },
      { new: true, runValidators: true }
    );
    if (!updated) throw new NotFoundError('Employee not found');
    
    const timeline = new EmploymentTimeline({
      tenantId: this.tenantId,
      employeeId: updated._id,
      eventType: 'PROFILE_UPDATED',
      title: 'Employee Profile Updated',
      performedByUserId: new mongoose.Types.ObjectId(userId)
    });
    await timeline.save();

    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'Employee', entityId: updated.id, performedBy: userId });
    return updated;
  }

  async deactivateEmployee(employeeId: string, userId: string) {
    const employee = await Employee.findOne({ tenantId: this.tenantId, _id: employeeId });
    if (!employee) throw new NotFoundError('Employee not found');

    const updated = await Employee.findOneAndUpdate(
      { tenantId: this.tenantId, _id: employeeId },
      { status: 'INACTIVE' },
      { new: true }
    );

    const timeline = new EmploymentTimeline({
      tenantId: this.tenantId,
      employeeId: employee._id,
      eventType: 'DEACTIVATION',
      title: 'Employee Deactivated',
      performedByUserId: new mongoose.Types.ObjectId(userId)
    });
    await timeline.save();

    AuditService.log({ tenantId: this.tenantId, action: 'DEACTIVATE', entityType: 'Employee', entityId: employeeId, performedBy: userId });
    return updated;
  }

  async addDocument(employeeId: string, data: any, userId: string) {
    const doc = new EmployeeDocument({
      ...data,
      tenantId: this.tenantId,
      employeeId,
      uploadedBy: userId,
    });
    await doc.save();
    return doc;
  }

  async getDocuments(employeeId: string) {
    return EmployeeDocument.find({ tenantId: this.tenantId, employeeId, isDeleted: { $ne: true } });
  }

  async getAllDocuments(query: any = {}) {
    const filter: any = { tenantId: this.tenantId, isDeleted: { $ne: true } };
    if (query.employeeId) filter.employeeId = query.employeeId;
    return EmployeeDocument.find(filter)
      .populate('employeeId', 'firstName lastName employeeIdNumber departmentId designationId email mobile joiningDate')
      .sort({ createdAt: -1 });
  }

  async verifyDocument(documentId: string, status: 'VERIFIED' | 'REJECTED', userId: string, remarks?: string) {
    const doc = await EmployeeDocument.findOneAndUpdate(
      { _id: documentId, tenantId: this.tenantId },
      { verificationStatus: status, verifiedBy: userId, remarks: remarks || undefined },
      { new: true }
    );
    if (!doc) throw new NotFoundError('Document not found');
    return doc;
  }

  async addQualification(employeeId: string, data: any, userId: string) {
    const qual = new EmployeeQualification({
      ...data,
      tenantId: this.tenantId,
      employeeId,
    });
    await qual.save();
    return qual;
  }

  async getQualifications(employeeId: string) {
    return EmployeeQualification.find({ tenantId: this.tenantId, employeeId, isDeleted: { $ne: true } });
  }

  async addExperience(employeeId: string, data: any, userId: string) {
    const exp = new EmployeeExperience({
      ...data,
      tenantId: this.tenantId,
      employeeId,
    });
    await exp.save();
    return exp;
  }

  async getExperience(employeeId: string) {
    return EmployeeExperience.find({ tenantId: this.tenantId, employeeId, isDeleted: { $ne: true } });
  }
}
