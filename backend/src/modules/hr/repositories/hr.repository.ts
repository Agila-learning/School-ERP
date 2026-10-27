import { BaseRepository } from '../../../core/repositories/base.repository';
import Employee, { IEmployee } from '../models/Employee.model';
import TeacherProfile, { ITeacherProfile } from '../models/TeacherProfile.model';
import EmployeeDocument, { IEmployeeDocument } from '../models/EmployeeDocument.model';
import EmployeeBankProfile, { IEmployeeBankProfile } from '../models/EmployeeBankProfile.model';
import EmployeeStatutoryProfile, { IEmployeeStatutoryProfile } from '../models/EmployeeStatutoryProfile.model';
import EmploymentTimeline, { IEmploymentTimeline } from '../models/EmploymentTimeline.model';

export class EmployeeRepository extends BaseRepository<IEmployee> {
  constructor(tenantId: string) { super(Employee, tenantId); }
}

export class TeacherProfileRepository extends BaseRepository<ITeacherProfile> {
  constructor(tenantId: string) { super(TeacherProfile, tenantId); }
}

export class EmployeeDocumentRepository extends BaseRepository<IEmployeeDocument> {
  constructor(tenantId: string) { super(EmployeeDocument, tenantId); }
}

export class EmployeeBankProfileRepository extends BaseRepository<IEmployeeBankProfile> {
  constructor(tenantId: string) { super(EmployeeBankProfile, tenantId); }
}

export class EmployeeStatutoryProfileRepository extends BaseRepository<IEmployeeStatutoryProfile> {
  constructor(tenantId: string) { super(EmployeeStatutoryProfile, tenantId); }
}

export class EmploymentTimelineRepository extends BaseRepository<IEmploymentTimeline> {
  constructor(tenantId: string) { super(EmploymentTimeline, tenantId); }
}
