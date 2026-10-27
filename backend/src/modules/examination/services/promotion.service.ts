import mongoose from 'mongoose';
import StudentResult from '../models/StudentResult.model';
import PromotionRecord from '../../academic/models/PromotionRecord.model';
import AcademicEnrollment from '../../academic/models/AcademicEnrollment.model';

/**
 * PromotionEngine
 * Reads calculated StudentResults and applies promotion rules.
 */
export class PromotionEngine {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Run promotion logic based on final academic year results.
   */
  async processPromotions(examinationId: string, promotedByUserId: string) {
    const tid = new mongoose.Types.ObjectId(this.tenantId);
    const examObjId = new mongoose.Types.ObjectId(examinationId);

    // Only process results that are APPROVED or PUBLISHED
    const results = await StudentResult.find({
      tenantId: tid,
      examinationId: examObjId,
      version: 1,
      status: { $in: ['APPROVED', 'PUBLISHED'] },
      isDeleted: { $ne: true },
    }).lean();

    const session = await mongoose.startSession();
    session.startTransaction();

    let processedCount = 0;

    try {
      for (const result of results) {
        // If promotion status is already manually overridden or handled, skip
        if (result.promotionStatus !== 'PENDING' && result.promotionStatus !== 'NOT_PROMOTED') {
             if (result.promotionOverrideReason) continue;
        }

        // Apply simple default promotion rule: isOverallPassed = true
        // In a real system, this would load a PromotionRule model and evaluate it.
        const newStatus = result.isOverallPassed ? 'PROMOTED' : 'NOT_PROMOTED';

        // Update StudentResult
        await StudentResult.findOneAndUpdate(
          { _id: result._id },
          { $set: { promotionStatus: newStatus } },
          { session }
        );

        // Find current academic enrollment
        const currentEnrollment = await AcademicEnrollment.findOne({
          tenantId: tid,
          studentId: result.studentId,
          academicYearId: result.academicYearId,
          classId: result.classId,
          isDeleted: { $ne: true }
        }).session(session);

        if (currentEnrollment) {
           // Upsert PromotionRecord in academic module
           await PromotionRecord.findOneAndUpdate(
              {
                tenantId: tid,
                studentId: result.studentId,
                previousEnrollmentId: currentEnrollment._id,
              },
              {
                 $set: {
                   previousClassId: result.classId,
                   type: newStatus === 'PROMOTED' ? 'PROMOTED' : 'RETAINED',
                   promotedByUserId: new mongoose.Types.ObjectId(promotedByUserId),
                   promotionDate: new Date()
                 }
              },
              { upsert: true, session }
           );
        }

        processedCount++;
      }

      await session.commitTransaction();
      session.endSession();
      
      return { processed: processedCount };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
