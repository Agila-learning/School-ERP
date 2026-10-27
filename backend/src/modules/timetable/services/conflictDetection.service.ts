import mongoose from 'mongoose';
import TimetableEntry from '../models/TimetableEntry.model';
import TimetableConflict from '../models/TimetableConflict.model';
import TeacherAvailability from '../models/TeacherAvailability.model';
import RoomAvailability from '../models/RoomAvailability.model';

export interface ConflictCheckInput {
  tenantId: string;
  versionId: string;
  teacherEmployeeId: string;
  sectionId: string;
  roomId?: string;
  day: string;
  periodDefinitionId: string;
  excludeEntryId?: string;  // For edits — exclude the entry being updated
}

export interface ConflictResult {
  type: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  description: string;
}

/**
 * Central conflict detection service.
 * Runs synchronously on every entry upsert.
 * Results are stored in TimetableConflict.
 * Publishing is BLOCKED if any ERROR conflicts exist.
 */
export class ConflictDetectionService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async checkAllConflicts(input: ConflictCheckInput): Promise<ConflictResult[]> {
    const conflicts: ConflictResult[] = [];

    const toId = (val: any) => (val && mongoose.isValidObjectId(val) ? new mongoose.Types.ObjectId(val) : val);
    const tidFilter = {
      $in: [
        this.tenantId,
        ...(mongoose.isValidObjectId(this.tenantId) ? [new mongoose.Types.ObjectId(this.tenantId)] : [])
      ]
    };

    const baseFilter: Record<string, any> = {
      tenantId: tidFilter,
      versionId: toId(input.versionId),
      day: input.day,
      periodDefinitionId: toId(input.periodDefinitionId),
      status: 'ACTIVE',
      isDeleted: { $ne: true },
    };

    if (input.excludeEntryId) {
      baseFilter._id = { $ne: toId(input.excludeEntryId) };
    }

    // 1. Teacher double-booking
    if (input.teacherEmployeeId) {
      const teacherConflict = await TimetableEntry.findOne({
        ...baseFilter,
        teacherEmployeeId: toId(input.teacherEmployeeId),
      });
      if (teacherConflict) {
        conflicts.push({
          type: 'TEACHER_DOUBLE_BOOKING',
          severity: 'ERROR',
          description: `Teacher is already assigned to section ${teacherConflict.sectionId} on ${input.day}, Period ${input.periodDefinitionId}`,
        });
      }
    }

    // 2. Class/Section double-booking
    if (input.sectionId) {
      const sectionConflict = await TimetableEntry.findOne({
        ...baseFilter,
        sectionId: toId(input.sectionId),
      });
      if (sectionConflict) {
        conflicts.push({
          type: 'CLASS_DOUBLE_BOOKING',
          severity: 'ERROR',
          description: `Section already has a class on ${input.day}, Period ${input.periodDefinitionId}`,
        });
      }
    }

    // 3. Room double-booking
    if (input.roomId) {
      const roomConflict = await TimetableEntry.findOne({
        ...baseFilter,
        roomId: toId(input.roomId),
      });
      if (roomConflict) {
        conflicts.push({
          type: 'ROOM_DOUBLE_BOOKING',
          severity: 'ERROR',
          description: `Room is already booked on ${input.day}, Period ${input.periodDefinitionId}`,
        });
      }
    }

    // 4. Teacher availability constraint
    const teacherUnavailable = await TeacherAvailability.findOne({
      tenantId: new mongoose.Types.ObjectId(this.tenantId),
      teacherEmployeeId: new mongoose.Types.ObjectId(input.teacherEmployeeId),
      day: input.day as any,
      periodDefinitionId: new mongoose.Types.ObjectId(input.periodDefinitionId),
      isDeleted: { $ne: true },
    });
    if (teacherUnavailable) {
      conflicts.push({
        type: 'TEACHER_UNAVAILABLE',
        severity: 'WARNING',
        description: `Teacher has marked themselves unavailable on ${input.day}, Period ${input.periodDefinitionId}. Reason: ${teacherUnavailable.reason ?? 'N/A'}`,
      });
    }

    // 5. Room availability constraint
    if (input.roomId) {
      const roomUnavailable = await RoomAvailability.findOne({
        tenantId: new mongoose.Types.ObjectId(this.tenantId),
        roomId: new mongoose.Types.ObjectId(input.roomId),
        day: input.day as any,
        periodDefinitionId: new mongoose.Types.ObjectId(input.periodDefinitionId),
        isDeleted: { $ne: true },
      });
      if (roomUnavailable) {
        conflicts.push({
          type: 'ROOM_UNAVAILABLE',
          severity: 'WARNING',
          description: `Room is blocked on ${input.day}, Period ${input.periodDefinitionId}. Reason: ${roomUnavailable.blockedFor ?? 'N/A'}`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Persist detected conflicts to TimetableConflict collection.
   */
  async persistConflicts(versionId: string, entryIds: string[], conflicts: ConflictResult[]) {
    const docs = conflicts.map(c => ({
      tenantId: this.tenantId,
      versionId: new mongoose.Types.ObjectId(versionId),
      conflictType: c.type,
      severity: c.severity,
      description: c.description,
      relatedEntryIds: entryIds.map(id => new mongoose.Types.ObjectId(id)),
      isResolved: false,
    }));
    if (docs.length > 0) {
      await TimetableConflict.insertMany(docs);
    }
  }

  /**
   * Check if a version has any unresolved ERROR-severity conflicts.
   * Used to block publishing.
   */
  async hasBlockingConflicts(versionId: string): Promise<boolean> {
    const count = await TimetableConflict.countDocuments({
      tenantId: this.tenantId,
      versionId: new mongoose.Types.ObjectId(versionId),
      severity: 'ERROR',
      isResolved: false,
      isDeleted: { $ne: true },
    });
    return count > 0;
  }
}
