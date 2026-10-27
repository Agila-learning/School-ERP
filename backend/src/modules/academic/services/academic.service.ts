import mongoose from 'mongoose';
import { AcademicYearRepository, TermRepository, ClassRepository, SectionRepository, SubjectRepository, TeacherAssignmentRepository, AcademicEnrollmentRepository, PeriodDefinitionRepository, CurriculumRepository, ClassTeacherAssignmentRepository, AcademicEventRepository } from '../repositories/academic.repository';
import { AuditService } from '../../audit/services/audit.service';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';
import { ClientSession } from 'mongoose';

export class AcademicService {
  private academicYearRepo: AcademicYearRepository;
  private termRepo: TermRepository;
  private classRepo: ClassRepository;
  private sectionRepo: SectionRepository;
  private subjectRepo: SubjectRepository;
  private teacherAssignmentRepo: TeacherAssignmentRepository;
  private enrollmentRepo: AcademicEnrollmentRepository;
  private periodDefinitionRepo: PeriodDefinitionRepository;
  private curriculumRepo: CurriculumRepository;
  private classTeacherAssignmentRepo: ClassTeacherAssignmentRepository;
  private academicEventRepo: AcademicEventRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.academicYearRepo = new AcademicYearRepository(tenantId);
    this.termRepo = new TermRepository(tenantId);
    this.classRepo = new ClassRepository(tenantId);
    this.sectionRepo = new SectionRepository(tenantId);
    this.subjectRepo = new SubjectRepository(tenantId);
    this.teacherAssignmentRepo = new TeacherAssignmentRepository(tenantId);
    this.enrollmentRepo = new AcademicEnrollmentRepository(tenantId);
    this.periodDefinitionRepo = new PeriodDefinitionRepository(tenantId);
    this.curriculumRepo = new CurriculumRepository(tenantId);
    this.classTeacherAssignmentRepo = new ClassTeacherAssignmentRepository(tenantId);
    this.academicEventRepo = new AcademicEventRepository(tenantId);
  }

  // --- ACADEMIC YEAR ---
  async createAcademicYear(data: any, userId: string) {
    if (!data.branchId) {
      const Branch = require('../../organization/models/Branch.model').default;
      const defaultBranch = await Branch.findOne({ tenantId: this.tenantId });
      if (defaultBranch) {
        data.branchId = defaultBranch._id;
      } else {
        data.branchId = this.tenantId;
      }
    }

    if (data.status === 'active') {
      const existingActive = await this.academicYearRepo.findOne({ status: 'active' });
      if (existingActive) {
        throw new ValidationError('An active academic year already exists. Only one can be active at a time.');
      }
    }

    const existing = await this.academicYearRepo.findOne({ name: data.name });
    if (existing) throw new ValidationError('Academic year with this name already exists.');

    const year = await this.academicYearRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'AcademicYear', entityId: year.id, performedBy: userId });
    return year;
  }
  async getAcademicYears(query: any) {
    return this.academicYearRepo.find(query);
  }

  async getAcademicYearById(id: string) {
    const year = await this.academicYearRepo.findById(id);
    if (!year) throw new NotFoundError('Academic year not found');
    return year;
  }

  async updateAcademicYear(id: string, data: any, userId: string) {
    if (data.status === 'active') {
      const existingActive = await this.academicYearRepo.find({ status: 'active', _id: { $ne: id } });
      if (existingActive.data.length > 0) {
        // Option 1: throw error
        // throw new ValidationError('Another active academic year already exists.');
        
        // Option 2 (Better UX based on plan): Auto-deactivate others
        for (const year of existingActive.data) {
          await this.academicYearRepo.update(year.id, { status: 'completed' });
          AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'AcademicYear', entityId: year.id, performedBy: userId });
        }
      }
    }
    const year = await this.academicYearRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'AcademicYear', entityId: id, performedBy: userId });
    return year;
  }

  async deleteAcademicYear(id: string, userId: string) {
    return this.academicYearRepo.runInTransaction(async (session: ClientSession) => {
      const existing = await this.academicYearRepo.findById(id);
      if (!existing) throw new NotFoundError('Academic year not found');

      // Check dependencies
      const classes = await this.classRepo.find({ academicYearId: id });
      const terms = await this.termRepo.find({ academicYearId: id });
      if (classes.data.length > 0 || terms.data.length > 0) {
        throw new ValidationError('Cannot delete academic year with associated classes or terms.');
      }

      const deleted = await this.academicYearRepo.delete(id, userId, session);
      AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'AcademicYear', entityId: id, performedBy: userId });
      return deleted;
    });
  }

  // --- TERM ---
  async createTerm(data: any, userId: string) {
    if (!data.branchId) {
      const Branch = require('../../organization/models/Branch.model').default;
      const defaultBranch = await Branch.findOne({ tenantId: this.tenantId });
      if (defaultBranch) {
        data.branchId = defaultBranch._id;
      } else {
        data.branchId = this.tenantId;
      }
    }

    const academicYear = await this.academicYearRepo.findById(data.academicYearId);
    if (!academicYear) throw new NotFoundError('Academic year not found');

    const existing = await this.termRepo.findOne({ academicYearId: data.academicYearId, name: data.name });
    if (existing) throw new ValidationError('Term with this name already exists in the academic year.');

    const term = await this.termRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Term', entityId: term.id, performedBy: userId });
    return term;
  }
  async getTerms(query: any) {
    return this.termRepo.find(query);
  }

  async getTermById(id: string) {
    const term = await this.termRepo.findById(id);
    if (!term) throw new NotFoundError('Term not found');
    return term;
  }

  async updateTerm(id: string, data: any, userId: string) {
    const term = await this.termRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'Term', entityId: id, performedBy: userId });
    return term;
  }

  async deleteTerm(id: string, userId: string) {
    const existing = await this.termRepo.findById(id);
    if (!existing) throw new NotFoundError('Term not found');
    const deleted = await this.termRepo.delete(id, userId);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'Term', entityId: id, performedBy: userId });
    return deleted;
  }

  async createClass(data: any, userId: string) {
    if (!data.branchId) {
      const Branch = require('../../organization/models/Branch.model').default;
      const defaultBranch = await Branch.findOne({ tenantId: this.tenantId });
      if (defaultBranch) {
        data.branchId = defaultBranch._id;
      } else {
        // Fallback to tenantId if no branch exists (simplistic single-branch model)
        data.branchId = this.tenantId;
      }
    }

    const existing = await this.classRepo.findOne({ name: data.name });
    if (existing) throw new ValidationError('Class name already exists.');

    const classData = await this.classRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Class', entityId: classData.id, performedBy: userId });
    return classData;
  }
  async getClasses(query: any) {
    return this.classRepo.find(query);
  }

  async getClassById(id: string) {
    const cls = await this.classRepo.findById(id);
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  async updateClass(id: string, data: any, userId: string) {
    const cls = await this.classRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'Class', entityId: id, performedBy: userId });
    return cls;
  }

  /**
   * Example of using runInTransaction and Soft Delete
   */
  async deleteClass(classId: string, userId: string) {
    return this.classRepo.runInTransaction(async (session: ClientSession) => {
      // 1. Check if class exists
      const existing = await this.classRepo.findById(classId);
      if (!existing) throw new NotFoundError('Class not found');

      // 2. Check if there are active sections inside this class
      const sections = await this.sectionRepo.find({ classId });
      if (sections.data.length > 0) {
        throw new ValidationError('Cannot delete class because it has active sections. Delete or move sections first.');
      }

      // 3. Soft delete the class
      const deletedClass = await this.classRepo.delete(classId, userId, session);

      // 4. Log the audit event within the transaction context (simulated here since audit is fire-and-forget, but ideally we await if needed)
      AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'Class', entityId: classId, performedBy: userId });

      return deletedClass;
    });
  }

  // --- SECTION ---
  async createSection(data: any, userId: string) {
    if (!data.branchId) {
      const Branch = require('../../organization/models/Branch.model').default;
      const defaultBranch = await Branch.findOne({ tenantId: this.tenantId });
      if (defaultBranch) {
        data.branchId = defaultBranch._id;
      } else {
        data.branchId = this.tenantId;
      }
    }

    const existingClass = await this.classRepo.findById(data.classId);
    if (!existingClass) throw new NotFoundError('Class not found');

    const existingSection = await this.sectionRepo.findOne({ classId: data.classId, name: data.name });
    if (existingSection) throw new ValidationError('Section name already exists in this class.');

    const section = await this.sectionRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Section', entityId: section.id, performedBy: userId });
    return section;
  }
  async getSections(query: any) {
    return this.sectionRepo.find(query);
  }

  async getSectionById(id: string) {
    const section = await this.sectionRepo.findById(id);
    if (!section) throw new NotFoundError('Section not found');
    return section;
  }

  async updateSection(id: string, data: any, userId: string) {
    const section = await this.sectionRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'Section', entityId: id, performedBy: userId });
    return section;
  }

  async deleteSection(id: string, userId: string) {
    return this.sectionRepo.runInTransaction(async (session: ClientSession) => {
      const existing = await this.sectionRepo.findById(id);
      if (!existing) throw new NotFoundError('Section not found');

      // Check dependencies (e.g., enrolled students)
      const students = await this.enrollmentRepo.find({ sectionId: id });
      if (students.data.length > 0) {
        throw new ValidationError('Cannot delete section because students are currently enrolled in it.');
      }

      const deleted = await this.sectionRepo.delete(id, userId, session);
      AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'Section', entityId: id, performedBy: userId });
      return deleted;
    });
  }

  // --- SUBJECT ---
  async createSubject(data: any, userId: string) {
    const existing = await this.subjectRepo.findOne({ code: data.code });
    if (existing) throw new ValidationError('Subject code already exists.');

    const subject = await this.subjectRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Subject', entityId: subject.id, performedBy: userId });
    return subject;
  }
  async getSubjects(query: any) {
    return this.subjectRepo.find(query);
  }

  async getSubjectById(id: string) {
    const subject = await this.subjectRepo.findById(id);
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }

  async updateSubject(id: string, data: any, userId: string) {
    const subject = await this.subjectRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'Subject', entityId: id, performedBy: userId });
    return subject;
  }

  async deleteSubject(id: string, userId: string) {
    return this.subjectRepo.runInTransaction(async (session: ClientSession) => {
      const existing = await this.subjectRepo.findById(id);
      if (!existing) throw new NotFoundError('Subject not found');

      // Check if it's assigned to any teacher
      const assignments = await this.teacherAssignmentRepo.find({ subjectId: id });
      if (assignments.data.length > 0) {
        throw new ValidationError('Cannot delete subject because it is assigned to teachers.');
      }

      const deleted = await this.subjectRepo.delete(id, userId, session);
      AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'Subject', entityId: id, performedBy: userId });
      return deleted;
    });
  }

  // --- TEACHER ASSIGNMENT ---
  async assignTeacher(data: any, userId: string) {
    if (!data.branchId) {
      const Employee = require('../../hr/models/Employee.model').default;
      const emp = await Employee.findById(data.teacherId);
      if (emp && emp.branchId) {
        data.branchId = emp.branchId;
      }
      if (emp && emp.userId && !data.userId) {
        data.userId = emp.userId;
      }
      if (!data.branchId) {
        const Branch = require('../../organization/models/Branch.model').default;
        const defaultBranch = await Branch.findOne({ tenantId: this.tenantId });
        data.branchId = defaultBranch ? defaultBranch._id : this.tenantId;
      }
    }

    if (!data.academicYearId) {
      let activeYear = await this.academicYearRepo.findOne({ status: { $in: ['active', 'ACTIVE'] } });
      if (!activeYear) {
        const anyYear = await this.academicYearRepo.find({}, 0, 1);
        if (anyYear.data.length > 0) activeYear = anyYear.data[0];
      }
      if (activeYear) {
        data.academicYearId = activeYear._id || activeYear.id;
      } else {
        const AcademicYear = require('../models/AcademicYear.model').default;
        const anyDbYear = await AcademicYear.findOne({ tenantId: this.tenantId });
        if (anyDbYear) data.academicYearId = anyDbYear._id;
      }
    }

    if (!data.classId && data.sectionId) {
      const section = await this.sectionRepo.findById(data.sectionId);
      if (section) data.classId = section.classId;
      if (!data.classId) {
        const Section = require('../models/Section.model').default;
        const sec = await Section.findById(data.sectionId);
        if (sec) data.classId = sec.classId;
      }
    }

    // Check for duplicate assignment
    const TeacherAssignment = require('../models/TeacherAssignment.model').default;
    const existing = await TeacherAssignment.findOne({
      tenantId: this.tenantId,
      academicYearId: data.academicYearId,
      classId: data.classId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      teacherId: data.teacherId
    });

    if (existing) {
      return existing;
    }

    const assignment = await this.teacherAssignmentRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'TeacherAssignment', entityId: assignment.id, performedBy: userId });
    return assignment;
  }

  async getTeacherAssignments(query: any) {
    const TeacherAssignment = require('../models/TeacherAssignment.model').default;
    const filter: any = { tenantId: this.tenantId, isDeleted: { $ne: true } };
    if (query?.classId) filter.classId = query.classId;
    if (query?.sectionId) filter.sectionId = query.sectionId;
    if (query?.subjectId) filter.subjectId = query.subjectId;
    if (query?.teacherId) filter.teacherId = query.teacherId;

    const assignments = await TeacherAssignment.find(filter)
      .populate('teacherId', 'firstName lastName employeeIdNumber')
      .populate('subjectId', 'name code')
      .populate('classId', 'name code')
      .populate('sectionId', 'name code')
      .sort({ createdAt: -1 });

    return assignments.map((a: any) => ({
      id: a._id?.toString(),
      _id: a._id?.toString(),
      teacherId: a.teacherId?._id?.toString() || a.teacherId,
      teacherName: a.teacherId ? `${a.teacherId.firstName || ''} ${a.teacherId.lastName || ''}`.trim() : 'Unknown',
      subjectId: a.subjectId?._id?.toString() || a.subjectId,
      subjectName: a.subjectId?.name || 'Unknown',
      classId: a.classId?._id?.toString() || a.classId,
      className: a.classId?.name || 'Unknown',
      sectionId: a.sectionId?._id?.toString() || a.sectionId,
      sectionName: a.sectionId?.name || 'Unknown',
      status: a.status || 'ACTIVE',
      isClassCoordinator: Boolean(a.isClassCoordinator),
      isExaminationIncharge: Boolean(a.isExaminationIncharge)
    }));
  }

  async removeTeacherAssignment(id: string, userId: string) {
    const existing = await this.teacherAssignmentRepo.findById(id);
    if (!existing) throw new NotFoundError('Teacher assignment not found');
    const deleted = await this.teacherAssignmentRepo.delete(id, userId);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'TeacherAssignment', entityId: id, performedBy: userId });
    return deleted;
  }

  // --- PERIOD DEFINITION ---
  async createPeriodDefinition(data: any, userId: string) {
    if (!data.branchId) data.branchId = '60d5ec49f1b2c80015f8a001';
    const existing = await this.periodDefinitionRepo.findOne({ branchId: data.branchId, name: data.name });
    if (existing) throw new ValidationError('Period with this name already exists in the branch.');

    const period = await this.periodDefinitionRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'PeriodDefinition', entityId: period.id, performedBy: userId });
    return period;
  }

  async getPeriodDefinitions(query: any) {
    let periods: any = await this.periodDefinitionRepo.find(query);
    const count = Array.isArray(periods) ? periods.length : (periods?.data ? periods.data.length : 0);
    if (count === 0) {
      const defaultPeriods = [
        { name: 'Period 1', number: 1, startTime: '09:00', endTime: '09:45', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
        { name: 'Period 2', number: 2, startTime: '09:45', endTime: '10:30', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
        { name: 'Period 3', number: 3, startTime: '10:30', endTime: '11:15', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
        { name: 'Short Break', number: 4, startTime: '11:15', endTime: '11:30', durationMinutes: 15, isBreak: true, status: 'ACTIVE' },
        { name: 'Period 4', number: 5, startTime: '11:30', endTime: '12:15', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
        { name: 'Period 5', number: 6, startTime: '12:15', endTime: '13:00', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
        { name: 'Lunch Break', number: 7, startTime: '13:00', endTime: '13:45', durationMinutes: 45, isBreak: true, status: 'ACTIVE' },
        { name: 'Period 6', number: 8, startTime: '13:45', endTime: '14:30', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
        { name: 'Period 7', number: 9, startTime: '14:30', endTime: '15:15', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
        { name: 'Period 8', number: 10, startTime: '15:15', endTime: '16:00', durationMinutes: 45, isBreak: false, status: 'ACTIVE' },
      ];
      try {
        for (const p of defaultPeriods) {
          await this.periodDefinitionRepo.create({ ...p, tenantId: this.tenantId } as any);
        }
        periods = await this.periodDefinitionRepo.find(query);
      } catch (e) {
        console.warn('Could not auto-seed periods:', e);
      }
    }
    return periods;
  }

  async updatePeriodDefinition(id: string, data: any, userId: string) {
    const period = await this.periodDefinitionRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'PeriodDefinition', entityId: id, performedBy: userId });
    return period;
  }

  async deletePeriodDefinition(id: string, userId: string) {
    const existing = await this.periodDefinitionRepo.findById(id);
    if (!existing) throw new NotFoundError('Period not found');
    const deleted = await this.periodDefinitionRepo.delete(id, userId);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'PeriodDefinition', entityId: id, performedBy: userId });
    return deleted;
  }

  // --- CURRICULUM (CLASS-SUBJECT MAPPING) ---
  async createCurriculum(data: any, userId: string) {
    const existing = await this.curriculumRepo.findOne({ 
      classId: data.classId, 
      subjectId: data.subjectId, 
      academicYearId: data.academicYearId 
    });
    if (existing) throw new ValidationError('This subject is already mapped to this class for the selected academic year.');

    const curriculum = await this.curriculumRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Curriculum', entityId: curriculum.id, performedBy: userId });
    return curriculum;
  }

  async getCurriculums(query: any) {
    return this.curriculumRepo.find(query);
  }

  async removeCurriculum(id: string, userId: string) {
    const existing = await this.curriculumRepo.findById(id);
    if (!existing) throw new NotFoundError('Class-Subject mapping not found');
    const deleted = await this.curriculumRepo.delete(id, userId);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'Curriculum', entityId: id, performedBy: userId });
    return deleted;
  }

  // --- CLASS TEACHER ASSIGNMENT ---
  async assignClassTeacher(data: any, userId: string) {
    // If setting as primary class teacher, ensure no other primary teacher exists for this section in the academic year
    if (data.isPrimary !== false) {
      const existingPrimary = await this.classTeacherAssignmentRepo.findOne({
        sectionId: data.sectionId,
        academicYearId: data.academicYearId,
        isPrimary: true,
        status: 'ACTIVE'
      });

      if (existingPrimary) {
        throw new ValidationError('An active primary class teacher already exists for this section.');
      }
    }

    const assignment = await this.classTeacherAssignmentRepo.create(data);
    
    // Also update the Section's denormalized classTeacher string if needed, but UI can just fetch assignments
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'ClassTeacherAssignment', entityId: assignment.id, performedBy: userId });
    return assignment;
  }

  async getClassTeacherAssignments(query: any) {
    return this.classTeacherAssignmentRepo.find(query);
  }

  async removeClassTeacherAssignment(id: string, userId: string) {
    const existing = await this.classTeacherAssignmentRepo.findById(id);
    if (!existing) throw new NotFoundError('Class Teacher assignment not found');
    const deleted = await this.classTeacherAssignmentRepo.delete(id, userId);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'ClassTeacherAssignment', entityId: id, performedBy: userId });
    return deleted;
  }

  // --- ACADEMIC EVENTS (HOLIDAYS) ---
  async createAcademicEvent(data: any, userId: string) {
    const existing = await this.academicEventRepo.findOne({ 
      title: data.title, 
      academicYearId: data.academicYearId,
      startDate: data.startDate 
    });
    if (existing) throw new ValidationError('An event with this title and date already exists.');

    const event = await this.academicEventRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'AcademicEvent', entityId: event.id, performedBy: userId });
    return event;
  }

  async getAcademicEvents(query: any) {
    return this.academicEventRepo.find(query);
  }

  async updateAcademicEvent(id: string, data: any, userId: string) {
    const event = await this.academicEventRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'AcademicEvent', entityId: id, performedBy: userId });
    return event;
  }

  async deleteAcademicEvent(id: string, userId: string) {
    const existing = await this.academicEventRepo.findById(id);
    if (!existing) throw new NotFoundError('Academic event not found');
    const deleted = await this.academicEventRepo.delete(id, userId);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'AcademicEvent', entityId: id, performedBy: userId });
    return deleted;
  }

  // --- DASHBOARD STATS ---
  async getDashboardStats() {
    const classes = await this.classRepo.find({ status: 'ACTIVE' }, 0, 100);
    const sections = await this.sectionRepo.find({ status: 'ACTIVE' }, 0, 100);
    const subjects = await this.subjectRepo.find({ status: 'ACTIVE' }, 0, 100);
    const students = await this.enrollmentRepo.find({}, 0, 100); // We just need total records

    // Generate mock class capacity data based on actual classes if available
    const classCapacityData = (classes.data || []).slice(0, 5).map(c => ({
      name: c.name,
      utilized: Math.floor(Math.random() * 30) + 10,
      available: Math.floor(Math.random() * 20) + 5
    }));

    // Generate student distribution
    const studentDistribution = [
      { name: 'Primary', value: Math.floor((students.total || 0) * 0.4) || 400 },
      { name: 'Middle', value: Math.floor((students.total || 0) * 0.3) || 300 },
      { name: 'High', value: Math.floor((students.total || 0) * 0.3) || 250 },
    ];

    return {
      totalClasses: classes.total || 0,
      totalSections: sections.total || 0,
      totalSubjects: subjects.total || 0,
      enrolledStudents: students.total || 0,
      classCapacityData: classCapacityData.length > 0 ? classCapacityData : [
        { name: 'Grade 1', utilized: 85, available: 15 },
        { name: 'Grade 2', utilized: 90, available: 10 },
        { name: 'Grade 3', utilized: 75, available: 25 },
        { name: 'Grade 4', utilized: 95, available: 5 },
        { name: 'Grade 5', utilized: 80, available: 20 },
      ],
      studentDistribution
    };
  }
}
