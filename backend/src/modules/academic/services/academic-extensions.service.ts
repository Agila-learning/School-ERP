import mongoose from 'mongoose';
import { 
  SubjectGroupRepository, 
  SyllabusRepository, 
  SyllabusTopicRepository, 
  ClassroomAllocationRepository, 
  TransferRecordRepository 
} from '../repositories/academic.repository';
import { AuditService } from '../../audit/services/audit.service';
import { NotFoundError } from '../../../core/errors/AppError';

export class AcademicExtensionsService {
  private subjectGroupRepo: SubjectGroupRepository;
  private syllabusRepo: SyllabusRepository;
  private syllabusTopicRepo: SyllabusTopicRepository;
  private classroomAllocationRepo: ClassroomAllocationRepository;
  private transferRecordRepo: TransferRecordRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.subjectGroupRepo = new SubjectGroupRepository(tenantId);
    this.syllabusRepo = new SyllabusRepository(tenantId);
    this.syllabusTopicRepo = new SyllabusTopicRepository(tenantId);
    this.classroomAllocationRepo = new ClassroomAllocationRepository(tenantId);
    this.transferRecordRepo = new TransferRecordRepository(tenantId);
  }

  // --- SubjectGroup ---
  async createSubjectGroup(data: any, userId: string) {
    const result = await this.subjectGroupRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'SubjectGroup', entityId: result._id.toString(), performedBy: userId, metadata: { result } });
    return result;
  }

  async getSubjectGroups(query: any) {
    return this.subjectGroupRepo.find(query);
  }

  async updateSubjectGroup(id: string, data: any, userId: string) {
    const original = await this.subjectGroupRepo.findById(id);
    if (!original) throw new NotFoundError('SubjectGroup not found');
    const result = await this.subjectGroupRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'SubjectGroup', entityId: id, performedBy: userId, changes: { original, result } });
    return result;
  }

  async deleteSubjectGroup(id: string, userId: string) {
    const original = await this.subjectGroupRepo.findById(id);
    if (!original) throw new NotFoundError('SubjectGroup not found');
    await this.subjectGroupRepo.delete(id);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'SubjectGroup', entityId: id, performedBy: userId, metadata: { original } });
    return { success: true };
  }

  // --- Syllabus ---
  async createSyllabus(data: any, userId: string) {
    const result = await this.syllabusRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'Syllabus', entityId: result._id.toString(), performedBy: userId, metadata: { result } });
    return result;
  }

  async getSyllabuses(query: any) {
    return this.syllabusRepo.find(query);
  }

  async updateSyllabus(id: string, data: any, userId: string) {
    const original = await this.syllabusRepo.findById(id);
    if (!original) throw new NotFoundError('Syllabus not found');
    const result = await this.syllabusRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'Syllabus', entityId: id, performedBy: userId, changes: { original, result } });
    return result;
  }

  async deleteSyllabus(id: string, userId: string) {
    const original = await this.syllabusRepo.findById(id);
    if (!original) throw new NotFoundError('Syllabus not found');
    await this.syllabusRepo.delete(id);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'Syllabus', entityId: id, performedBy: userId, metadata: { original } });
    return { success: true };
  }

  // --- SyllabusTopic ---
  async createSyllabusTopic(data: any, userId: string) {
    const result = await this.syllabusTopicRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'SyllabusTopic', entityId: result._id.toString(), performedBy: userId, metadata: { result } });
    return result;
  }

  async getSyllabusTopics(query: any) {
    return this.syllabusTopicRepo.find(query);
  }

  async updateSyllabusTopic(id: string, data: any, userId: string) {
    const original = await this.syllabusTopicRepo.findById(id);
    if (!original) throw new NotFoundError('SyllabusTopic not found');
    const result = await this.syllabusTopicRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'SyllabusTopic', entityId: id, performedBy: userId, changes: { original, result } });
    return result;
  }

  async deleteSyllabusTopic(id: string, userId: string) {
    const original = await this.syllabusTopicRepo.findById(id);
    if (!original) throw new NotFoundError('SyllabusTopic not found');
    await this.syllabusTopicRepo.delete(id);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'SyllabusTopic', entityId: id, performedBy: userId, metadata: { original } });
    return { success: true };
  }

  // --- ClassroomAllocation ---
  async createClassroomAllocation(data: any, userId: string) {
    const result = await this.classroomAllocationRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'ClassroomAllocation', entityId: result._id.toString(), performedBy: userId, metadata: { result } });
    return result;
  }

  async getClassroomAllocations(query: any) {
    return this.classroomAllocationRepo.find(query);
  }

  async updateClassroomAllocation(id: string, data: any, userId: string) {
    const original = await this.classroomAllocationRepo.findById(id);
    if (!original) throw new NotFoundError('ClassroomAllocation not found');
    const result = await this.classroomAllocationRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'ClassroomAllocation', entityId: id, performedBy: userId, changes: { original, result } });
    return result;
  }

  async deleteClassroomAllocation(id: string, userId: string) {
    const original = await this.classroomAllocationRepo.findById(id);
    if (!original) throw new NotFoundError('ClassroomAllocation not found');
    await this.classroomAllocationRepo.delete(id);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'ClassroomAllocation', entityId: id, performedBy: userId, metadata: { original } });
    return { success: true };
  }

  // --- TransferRecord ---
  async createTransferRecord(data: any, userId: string) {
    const result = await this.transferRecordRepo.create(data);
    AuditService.log({ tenantId: this.tenantId, action: 'CREATE', entityType: 'TransferRecord', entityId: result._id.toString(), performedBy: userId, metadata: { result } });
    return result;
  }

  async getTransferRecords(query: any) {
    return this.transferRecordRepo.find(query);
  }

  async updateTransferRecord(id: string, data: any, userId: string) {
    const original = await this.transferRecordRepo.findById(id);
    if (!original) throw new NotFoundError('TransferRecord not found');
    const result = await this.transferRecordRepo.update(id, data);
    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'TransferRecord', entityId: id, performedBy: userId, changes: { original, result } });
    return result;
  }

  async deleteTransferRecord(id: string, userId: string) {
    const original = await this.transferRecordRepo.findById(id);
    if (!original) throw new NotFoundError('TransferRecord not found');
    await this.transferRecordRepo.delete(id);
    AuditService.log({ tenantId: this.tenantId, action: 'DELETE', entityType: 'TransferRecord', entityId: id, performedBy: userId, metadata: { original } });
    return { success: true };
  }
}
