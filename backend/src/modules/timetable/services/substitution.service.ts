import mongoose from 'mongoose';
import { SubstitutionRequestRepository, TimetableEntryRepository } from '../repositories/timetable.repository';
import { AuditService } from '../../audit/services/audit.service';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';
import SubstitutionRequest from '../models/SubstitutionRequest.model';
import TimetableEntry from '../models/TimetableEntry.model';
import Employee from '../../hr/models/Employee.model';

export class SubstitutionService {
  private subRepo: SubstitutionRequestRepository;
  private entryRepo: TimetableEntryRepository;
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.subRepo = new SubstitutionRequestRepository(tenantId);
    this.entryRepo = new TimetableEntryRepository(tenantId);
  }

  /**
   * Create substitution requests for all periods of an absent teacher on a given date.
   */
  async createSubstitutionRequests(data: {
    versionId: string;
    originalTeacherEmployeeId: string;
    date: string;
    day: string;
    reason: string;
    requestedByUserId: string;
  }) {
    const toId = (val: any) => (val && mongoose.isValidObjectId(val) ? new mongoose.Types.ObjectId(val) : val);
    const tidFilter = {
      $in: [
        this.tenantId,
        ...(mongoose.isValidObjectId(this.tenantId) ? [new mongoose.Types.ObjectId(this.tenantId)] : [])
      ]
    };

    // Find all active timetable entries for this teacher on this day
    const affectedEntries = await TimetableEntry.find({
      tenantId: tidFilter,
      versionId: toId(data.versionId),
      teacherEmployeeId: toId(data.originalTeacherEmployeeId),
      day: data.day as any,
      status: 'ACTIVE',
      isDeleted: { $ne: true },
    });

    if (affectedEntries.length === 0) {
      throw new NotFoundError('No timetable entries found for this teacher on this day.');
    }

    const requests = await SubstitutionRequest.insertMany(
      affectedEntries.map((entry: any) => ({
        tenantId: this.tenantId,
        versionId: entry.versionId,
        originalEntryId: entry._id,
        originalTeacherEmployeeId: toId(data.originalTeacherEmployeeId),
        date: new Date(data.date),
        day: data.day,
        periodDefinitionId: entry.periodDefinitionId,
        sectionId: entry.sectionId,
        subjectId: entry.subjectId,
        reason: data.reason,
        requestedByUserId: new mongoose.Types.ObjectId(data.requestedByUserId),
        status: 'PENDING',
      }))
    );

    return { created: requests.length, affectedPeriods: affectedEntries.length };
  }

  /**
   * Assign a substitute teacher to a pending substitution request.
   * Validates substitute is not already teaching in that period.
   */
  async assignSubstitute(requestId: string, substituteEmployeeId: string, assignedByUserId: string) {
    const request = await this.subRepo.findById(requestId);
    if (!request) throw new NotFoundError('Substitution request not found');
    if (request.status !== 'PENDING') throw new ValidationError('Request is no longer pending');

    // Validate substitute is free in this period on this day (for this version)
    const conflict = await TimetableEntry.findOne({
      tenantId: new mongoose.Types.ObjectId(this.tenantId),
      versionId: request.versionId,
      teacherEmployeeId: new mongoose.Types.ObjectId(substituteEmployeeId),
      day: request.day as any,
      periodDefinitionId: request.periodDefinitionId,
      status: 'ACTIVE',
      isDeleted: { $ne: true },
    });

    if (conflict) {
      throw new ValidationError('Substitute teacher is already assigned to another class in this period. Select a different substitute.');
    }

    const updated = await SubstitutionRequest.findByIdAndUpdate(
      requestId,
      {
        substituteTeacherEmployeeId: new mongoose.Types.ObjectId(substituteEmployeeId),
        assignedByUserId: new mongoose.Types.ObjectId(assignedByUserId),
        assignedAt: new Date(),
        status: 'ASSIGNED',
      },
      { new: true }
    );

    AuditService.log({ tenantId: this.tenantId, action: 'UPDATE', entityType: 'SubstitutionRequest', entityId: requestId, performedBy: assignedByUserId });

    // Notification hook — implement later when Notification module is ready
    // NotificationService.emit('SUBSTITUTION_ASSIGNED', { requestId, substituteEmployeeId });

    return updated;
  }

  /**
   * Get pending substitution requests.
   */
  async getPendingRequests(versionId?: string) {
    const filter: Record<string, any> = { status: 'PENDING' };
    if (versionId) filter.versionId = new mongoose.Types.ObjectId(versionId);
    return this.subRepo.find(filter);
  }
}
