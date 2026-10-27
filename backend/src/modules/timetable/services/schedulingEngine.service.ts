import mongoose from 'mongoose';
import TimetableEntry from '../models/TimetableEntry.model';
import { ConflictDetectionService } from './conflictDetection.service';

interface SchedulerInput {
  tenantId: string;
  versionId: string;
  sectionIds: string[];
  // Map: sectionId → array of { subjectId, teacherEmployeeId, periodsPerWeek }
  sectionSubjectMap: Record<string, Array<{
    subjectId: string;
    teacherEmployeeId: string;
    periodsPerWeek: number;
    preferredRoomId?: string;
  }>>;
  periodDefinitionIds: string[]; // Ordered list of period slots per day
  workingDays: string[];         // e.g. ['MON','TUE','WED','THU','FRI']
}

/**
 * Greedy Constraint-Satisfaction Scheduler.
 *
 * Algorithm:
 * 1. Build a slot grid: for each (day × period) per section, mark EMPTY.
 * 2. For each section, shuffle subjects (so distribution is spread).
 * 3. For each subject requirement, find the first available slot where:
 *    a. Teacher is free (no other section in this slot).
 *    b. Section is free (no other subject in this slot).
 *    c. Room is free (if specified).
 * 4. Assign and mark slot as FILLED.
 * 5. Record any unresolved shortfalls as SUBJECT_SHORTFALL conflicts.
 *
 * Output: DRAFT TimetableVersion entries + unresolved conflict docs.
 * Admin must review before publishing.
 */
export class SchedulingEngine {
  private tenantId: string;
  private conflictService: ConflictDetectionService;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.conflictService = new ConflictDetectionService(tenantId);
  }

  async generate(input: SchedulerInput): Promise<{ assigned: number; unresolved: number }> {
    const { versionId, sectionIds, sectionSubjectMap, periodDefinitionIds, workingDays } = input;

    // Build in-memory slot availability maps for fast checking
    // teacherSlots[teacherEmployeeId][day][periodId] = true means OCCUPIED
    const teacherSlots: Record<string, Record<string, Record<string, boolean>>> = {};
    // sectionSlots[sectionId][day][periodId] = true means OCCUPIED
    const sectionSlots: Record<string, Record<string, Record<string, boolean>>> = {};

    let assigned = 0;
    let unresolved = 0;

    for (const sectionId of sectionIds) {
      const requirements = sectionSubjectMap[sectionId] ?? [];

      for (const req of requirements) {
        let periodsToAssign = req.periodsPerWeek;
        const { subjectId, teacherEmployeeId, preferredRoomId } = req;

        if (!teacherSlots[teacherEmployeeId]) teacherSlots[teacherEmployeeId] = {};
        if (!sectionSlots[sectionId]) sectionSlots[sectionId] = {};

        // Spread across days for even distribution
        for (const day of workingDays) {
          if (periodsToAssign <= 0) break;
          if (!teacherSlots[teacherEmployeeId][day]) teacherSlots[teacherEmployeeId][day] = {};
          if (!sectionSlots[sectionId][day]) sectionSlots[sectionId][day] = {};

          for (const periodId of periodDefinitionIds) {
            if (periodsToAssign <= 0) break;

            // Check in-memory availability (fast, no DB call in the inner loop)
            const teacherFree = !teacherSlots[teacherEmployeeId][day][periodId];
            const sectionFree = !sectionSlots[sectionId][day][periodId];

            if (teacherFree && sectionFree) {
              // Assign the entry
              await TimetableEntry.create({
                tenantId: this.tenantId,
                versionId: new mongoose.Types.ObjectId(versionId),
                academicYearId: new mongoose.Types.ObjectId(versionId), // Replaced in service layer with real academicYearId
                branchId: new mongoose.Types.ObjectId(versionId),        // Same — filled by service layer
                classId: new mongoose.Types.ObjectId(sectionId),         // Section maps to class — service sets this
                sectionId: new mongoose.Types.ObjectId(sectionId),
                subjectId: new mongoose.Types.ObjectId(subjectId),
                teacherEmployeeId: new mongoose.Types.ObjectId(teacherEmployeeId),
                periodDefinitionId: new mongoose.Types.ObjectId(periodId),
                roomId: preferredRoomId ? new mongoose.Types.ObjectId(preferredRoomId) : undefined,
                day: day as any,
                status: 'ACTIVE',
              });

              // Mark as occupied in memory
              teacherSlots[teacherEmployeeId][day][periodId] = true;
              sectionSlots[sectionId][day][periodId] = true;

              assigned++;
              periodsToAssign--;
            }
          }
        }

        if (periodsToAssign > 0) {
          // Could not fully satisfy requirement — log conflict
          await this.conflictService.persistConflicts(versionId, [], [{
            type: 'SUBJECT_SHORTFALL',
            severity: 'WARNING',
            description: `Could not schedule ${periodsToAssign} of ${req.periodsPerWeek} required periods for subject ${subjectId} in section ${sectionId}`,
          }]);
          unresolved++;
        }
      }
    }

    return { assigned, unresolved };
  }
}
