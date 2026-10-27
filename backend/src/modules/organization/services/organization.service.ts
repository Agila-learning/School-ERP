import { SchoolRepository, CampusRepository, BuildingRepository, RoomRepository, BranchRepository, DepartmentRepository } from '../repositories/organization.repository';
import { AuditService } from '../../audit/services/audit.service';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';

export class OrganizationService {
  private schoolRepo: SchoolRepository;
  private branchRepo: BranchRepository;
  private campusRepo: CampusRepository;
  private buildingRepo: BuildingRepository;
  private roomRepo: RoomRepository;
  private deptRepo: DepartmentRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.schoolRepo = new SchoolRepository(tenantId);
    this.branchRepo = new BranchRepository(tenantId);
    this.campusRepo = new CampusRepository(tenantId);
    this.buildingRepo = new BuildingRepository(tenantId);
    this.roomRepo = new RoomRepository(tenantId);
    this.deptRepo = new DepartmentRepository(tenantId);
  }

  // --- SCHOOLS ---
  async createSchool(data: any, userId: string) {
    const existing = await this.schoolRepo.findOne({ code: data.code });
    if (existing) throw new ValidationError('School code must be unique');

    const school = await this.schoolRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'School', entityId: school.id, performedBy: userId });
    return school;
  }

  async getSchools(skip: number, limit: number) {
    return this.schoolRepo.find({}, skip, limit);
  }

  // --- BRANCHES ---
  async createBranch(data: any, userId: string) {
    let schoolId = data.schoolId;
    if (!schoolId) {
      let firstSchool = await this.schoolRepo.findOne({});
      if (!firstSchool) {
        firstSchool = await this.schoolRepo.create({
          legalName: 'Main School',
          displayName: 'Main School',
          code: 'SCH-MAIN',
          status: 'ACTIVE'
        });
      }
      schoolId = firstSchool.id || firstSchool._id;
    }
    const school = schoolId ? await this.schoolRepo.findById(schoolId) : null;
    if (!school) throw new NotFoundError('School not found.');
    data.schoolId = school.id || school._id;

    const existing = await this.branchRepo.findOne({ code: data.code });
    if (existing) throw new ValidationError('Branch code must be unique');

    const branch = await this.branchRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Branch', entityId: branch.id, performedBy: userId });
    return branch;
  }

  async getBranches(skip: number = 0, limit: number = 10) {
    return this.branchRepo.find({}, skip, limit);
  }

  async updateBranch(id: string, data: any, userId: string) {
    const branch = await this.branchRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'Branch', entityId: id, performedBy: userId });
    return branch;
  }

  // --- CAMPUSES ---
  async createCampus(data: any, userId: string) {
    const branch = await this.branchRepo.findById(data.branchId);
    if (!branch) throw new NotFoundError('Branch not found');

    const existing = await this.campusRepo.findOne({ branchId: data.branchId, code: data.code });
    if (existing) throw new ValidationError('Campus code must be unique per branch');

    const campus = await this.campusRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Campus', entityId: campus.id, performedBy: userId });
    return campus;
  }

  // --- BUILDINGS ---
  async createBuilding(data: any, userId: string) {
    const campus = await this.campusRepo.findById(data.campusId);
    if (!campus) throw new NotFoundError('Campus not found');

    const existing = await this.buildingRepo.findOne({ campusId: data.campusId, code: data.code });
    if (existing) throw new ValidationError('Building code must be unique per campus');

    const building = await this.buildingRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Building', entityId: building.id, performedBy: userId });
    return building;
  }

  // --- ROOMS ---
  async getRooms(buildingId?: string) {
    const filter: any = {};
    if (buildingId) filter.buildingId = buildingId;
    return this.roomRepo.find(filter);
  }

  async createRoom(data: any, userId: string) {
    if (!data.buildingId) {
      let defaultBuilding = await this.buildingRepo.findOne({ tenantId: this.tenantId, name: 'Main Block' });
      if (!defaultBuilding) {
        const Campus = require('../models/Campus.model').default;
        const defaultCampus = await Campus.findOne({ tenantId: this.tenantId });
        defaultBuilding = await this.buildingRepo.create({
          tenantId: this.tenantId as any,
          campusId: defaultCampus ? defaultCampus._id : (this.tenantId as any),
          name: 'Main Block',
          code: 'MAIN'
        });
      }
      data.buildingId = defaultBuilding._id || defaultBuilding.id;
    }

    const building = await this.buildingRepo.findById(data.buildingId);
    if (!building) throw new NotFoundError('Building not found');

    const existing = await this.roomRepo.findOne({ buildingId: data.buildingId, code: data.code });
    if (existing) throw new ValidationError('Room code must be unique per building');

    const room = await this.roomRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Room', entityId: room.id, performedBy: userId });
    return room;
  }

  // --- DEPARTMENTS ---
  async createDepartment(data: any, userId: string) {
    const existing = await this.deptRepo.findOne({ code: data.code });
    if (existing) throw new ValidationError('Department code must be unique');

    const dept = await this.deptRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Department', entityId: dept.id, performedBy: userId });
    return dept;
  }

  async getDepartments(skip: number = 0, limit: number = 10) {
    return this.deptRepo.find({}, skip, limit);
  }

  async updateDepartment(id: string, data: any, userId: string) {
    const dept = await this.deptRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'Department', entityId: id, performedBy: userId });
    return dept;
  }
}
