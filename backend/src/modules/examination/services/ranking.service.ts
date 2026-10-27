import mongoose from 'mongoose';
import StudentResult from '../models/StudentResult.model';

export type RankStrategy = 'COMPETITION' | 'DENSE' | 'DISABLED';

/**
 * RankingService
 * Calculates ranks after result calculation.
 * Supports competition ranking (1,2,2,4) and dense ranking (1,2,2,3).
 * Idempotent — safe to re-run.
 */
export class RankingService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async calculateRanks(
    examinationId: string,
    scope: 'SECTION' | 'CLASS',
    strategy: RankStrategy = 'COMPETITION'
  ) {
    if (strategy === 'DISABLED') return;

    const tid = new mongoose.Types.ObjectId(this.tenantId);
    const examObjId = new mongoose.Types.ObjectId(examinationId);

    const results = await StudentResult.find({
      tenantId: tid,
      examinationId: examObjId,
      version: 1,
      status: { $in: ['CALCULATED', 'REVIEWED', 'APPROVED'] },
      isDeleted: { $ne: true },
    }).lean();

    // Group by scope (section or class)
    const groups = new Map<string, typeof results>();
    results.forEach((r: any) => {
      const key = scope === 'SECTION' ? r.sectionId.toString() : r.classId.toString();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    });

    for (const [, group] of groups) {
      // Sort by percentage descending, then GPA descending as tie-breaker
      const sorted = [...group].sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return (b.gpa ?? 0) - (a.gpa ?? 0);
      });

      let rank = 1;
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0) {
          const prev = sorted[i - 1];
          const curr = sorted[i];
          const tied = prev.percentage === curr.percentage && (prev.gpa ?? 0) === (curr.gpa ?? 0);
          if (!tied) {
            rank = strategy === 'COMPETITION' ? i + 1 : rank + 1;
          }
        }

        await StudentResult.findOneAndUpdate(
          { _id: sorted[i]._id },
          { $set: { rank, rankScope: scope } }
        );
      }
    }
  }
}
