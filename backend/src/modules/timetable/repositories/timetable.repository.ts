import { BaseRepository } from '../../../core/repositories/base.repository';
import TimetableVersion, { ITimetableVersion } from '../models/TimetableVersion.model';
import TimetableEntry, { ITimetableEntry } from '../models/TimetableEntry.model';
import TimetableConflict, { ITimetableConflict } from '../models/TimetableConflict.model';
import TimetableChangeLog, { ITimetableChangeLog } from '../models/TimetableChangeLog.model';
import TeacherAvailability, { ITeacherAvailability } from '../models/TeacherAvailability.model';
import RoomAvailability, { IRoomAvailability } from '../models/RoomAvailability.model';
import SubjectWeeklyRequirement, { ISubjectWeeklyRequirement } from '../models/SubjectWeeklyRequirement.model';
import SubstitutionRequest, { ISubstitutionRequest } from '../models/SubstitutionRequest.model';

export class TimetableVersionRepository extends BaseRepository<ITimetableVersion> {
  constructor(tenantId: string) { super(TimetableVersion, tenantId); }
}
export class TimetableEntryRepository extends BaseRepository<ITimetableEntry> {
  constructor(tenantId: string) { super(TimetableEntry, tenantId); }
}
export class TimetableConflictRepository extends BaseRepository<ITimetableConflict> {
  constructor(tenantId: string) { super(TimetableConflict, tenantId); }
}
export class TimetableChangeLogRepository extends BaseRepository<ITimetableChangeLog> {
  constructor(tenantId: string) { super(TimetableChangeLog, tenantId); }
}
export class TeacherAvailabilityRepository extends BaseRepository<ITeacherAvailability> {
  constructor(tenantId: string) { super(TeacherAvailability, tenantId); }
}
export class RoomAvailabilityRepository extends BaseRepository<IRoomAvailability> {
  constructor(tenantId: string) { super(RoomAvailability, tenantId); }
}
export class SubjectWeeklyRequirementRepository extends BaseRepository<ISubjectWeeklyRequirement> {
  constructor(tenantId: string) { super(SubjectWeeklyRequirement, tenantId); }
}
export class SubstitutionRequestRepository extends BaseRepository<ISubstitutionRequest> {
  constructor(tenantId: string) { super(SubstitutionRequest, tenantId); }
}
