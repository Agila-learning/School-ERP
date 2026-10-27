import { BaseRepository } from '../../../core/repositories/base.repository';
import AcademicYear, { IAcademicYear } from '../models/AcademicYear.model';
import Term, { ITerm } from '../models/Term.model';
import Class, { IClass } from '../models/Class.model';
import Section, { ISection } from '../models/Section.model';
import Subject, { ISubject } from '../models/Subject.model';
import SubjectGroup, { ISubjectGroup } from '../models/SubjectGroup.model';
import Curriculum, { ICurriculum } from '../models/Curriculum.model';
import Syllabus, { ISyllabus } from '../models/Syllabus.model';
import SyllabusTopic, { ISyllabusTopic } from '../models/SyllabusTopic.model';
import TeacherAssignment, { ITeacherAssignment } from '../models/TeacherAssignment.model';
import ClassTeacherAssignment, { IClassTeacherAssignment } from '../models/ClassTeacherAssignment.model';
import AcademicEnrollment, { IAcademicEnrollment } from '../models/AcademicEnrollment.model';
import PromotionRecord, { IPromotionRecord } from '../models/PromotionRecord.model';
import TransferRecord, { ITransferRecord } from '../models/TransferRecord.model';
import PeriodDefinition, { IPeriodDefinition } from '../models/PeriodDefinition.model';
import AcademicEvent, { IAcademicEvent } from '../models/AcademicEvent.model';
import ClassroomAllocation, { IClassroomAllocation } from '../models/ClassroomAllocation.model';

export class AcademicYearRepository extends BaseRepository<IAcademicYear> {
  constructor(tenantId: string) { super(AcademicYear, tenantId); }
}

export class TermRepository extends BaseRepository<ITerm> {
  constructor(tenantId: string) { super(Term, tenantId); }
}

export class ClassRepository extends BaseRepository<IClass> {
  constructor(tenantId: string) { super(Class, tenantId); }
}

export class SectionRepository extends BaseRepository<ISection> {
  constructor(tenantId: string) { super(Section, tenantId); }
}

export class SubjectRepository extends BaseRepository<ISubject> {
  constructor(tenantId: string) { super(Subject, tenantId); }
}

export class SubjectGroupRepository extends BaseRepository<ISubjectGroup> {
  constructor(tenantId: string) { super(SubjectGroup, tenantId); }
}

export class CurriculumRepository extends BaseRepository<ICurriculum> {
  constructor(tenantId: string) { super(Curriculum, tenantId); }
}

export class SyllabusRepository extends BaseRepository<ISyllabus> {
  constructor(tenantId: string) { super(Syllabus, tenantId); }
}

export class SyllabusTopicRepository extends BaseRepository<ISyllabusTopic> {
  constructor(tenantId: string) { super(SyllabusTopic, tenantId); }
}

export class TeacherAssignmentRepository extends BaseRepository<ITeacherAssignment> {
  constructor(tenantId: string) { super(TeacherAssignment, tenantId); }
}

export class ClassTeacherAssignmentRepository extends BaseRepository<IClassTeacherAssignment> {
  constructor(tenantId: string) { super(ClassTeacherAssignment, tenantId); }
}

export class AcademicEnrollmentRepository extends BaseRepository<IAcademicEnrollment> {
  constructor(tenantId: string) { super(AcademicEnrollment, tenantId); }
}

export class PromotionRecordRepository extends BaseRepository<IPromotionRecord> {
  constructor(tenantId: string) { super(PromotionRecord, tenantId); }
}

export class TransferRecordRepository extends BaseRepository<ITransferRecord> {
  constructor(tenantId: string) { super(TransferRecord, tenantId); }
}

export class PeriodDefinitionRepository extends BaseRepository<IPeriodDefinition> {
  constructor(tenantId: string) { super(PeriodDefinition, tenantId); }
}

export class AcademicEventRepository extends BaseRepository<IAcademicEvent> {
  constructor(tenantId: string) { super(AcademicEvent, tenantId); }
}

export class ClassroomAllocationRepository extends BaseRepository<IClassroomAllocation> {
  constructor(tenantId: string) { super(ClassroomAllocation, tenantId); }
}
