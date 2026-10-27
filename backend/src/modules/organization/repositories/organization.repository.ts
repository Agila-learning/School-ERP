import { BaseRepository } from '../../../core/repositories/base.repository';
import School, { ISchool } from '../models/School.model';
import Branch, { IBranch } from '../models/Branch.model';
import Campus, { ICampus } from '../models/Campus.model';
import Building, { IBuilding } from '../models/Building.model';
import Room, { IRoom } from '../models/Room.model';
import Department, { IDepartment } from '../models/Department.model';

export class SchoolRepository extends BaseRepository<ISchool> {
  constructor(tenantId: string) {
    super(School, tenantId);
  }
}

export class CampusRepository extends BaseRepository<ICampus> {
  constructor(tenantId: string) {
    super(Campus, tenantId);
  }
}

export class BuildingRepository extends BaseRepository<IBuilding> {
  constructor(tenantId: string) {
    super(Building, tenantId);
  }
}

export class RoomRepository extends BaseRepository<IRoom> {
  constructor(tenantId: string) {
    super(Room, tenantId);
  }
}

export class BranchRepository extends BaseRepository<IBranch> {
  constructor(tenantId: string) {
    super(Branch, tenantId);
  }
}

export class DepartmentRepository extends BaseRepository<IDepartment> {
  constructor(tenantId: string) {
    super(Department, tenantId);
  }
}
