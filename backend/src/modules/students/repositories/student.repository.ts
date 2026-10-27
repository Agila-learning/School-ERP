import { BaseRepository } from '../../../core/repositories/base.repository';
import Family, { IFamily } from '../models/Family.model';
import Parent, { IParent } from '../models/Parent.model';
import StudentProfile, { IStudentProfile } from '../models/StudentProfile.model';
import StudentAddress, { IStudentAddress } from '../models/StudentAddress.model';
import StudentDocument, { IStudentDocument } from '../models/StudentDocument.model';
import StudentMedicalProfile, { IStudentMedicalProfile } from '../models/StudentMedicalProfile.model';
import StudentTimeline, { IStudentTimeline } from '../models/StudentTimeline.model';
import StudentWithdrawalRecord, { IStudentWithdrawalRecord } from '../models/StudentWithdrawalRecord.model';

export class FamilyRepository extends BaseRepository<IFamily> {
  constructor(tenantId: string) { super(Family, tenantId); }
}

export class ParentRepository extends BaseRepository<IParent> {
  constructor(tenantId: string) { super(Parent, tenantId); }
}

export class StudentProfileRepository extends BaseRepository<IStudentProfile> {
  constructor(tenantId: string) { super(StudentProfile, tenantId); }
}

export class StudentAddressRepository extends BaseRepository<IStudentAddress> {
  constructor(tenantId: string) { super(StudentAddress, tenantId); }
}

export class StudentDocumentRepository extends BaseRepository<IStudentDocument> {
  constructor(tenantId: string) { super(StudentDocument, tenantId); }
}

export class StudentMedicalProfileRepository extends BaseRepository<IStudentMedicalProfile> {
  constructor(tenantId: string) { super(StudentMedicalProfile, tenantId); }
}

export class StudentTimelineRepository extends BaseRepository<IStudentTimeline> {
  constructor(tenantId: string) { super(StudentTimeline, tenantId); }
}

export class StudentWithdrawalRecordRepository extends BaseRepository<IStudentWithdrawalRecord> {
  constructor(tenantId: string) { super(StudentWithdrawalRecord, tenantId); }
}
