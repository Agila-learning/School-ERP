import mongoose from 'mongoose';
import ReportCard from '../models/ReportCard.model';
import StudentResult from '../models/StudentResult.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class ReportCardService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Generate report cards for a given exam and class.
   * Only processes PUBLISHED results.
   */
  async generateReportCards(examinationId: string, classId: string, generatedByUserId: string) {
    const tid = new mongoose.Types.ObjectId(this.tenantId);
    const examObjId = new mongoose.Types.ObjectId(examinationId);
    const classObjId = new mongoose.Types.ObjectId(classId);

    const results = await StudentResult.find({
      tenantId: tid,
      examinationId: examObjId,
      classId: classObjId,
      version: 1,
      status: 'PUBLISHED',
      isDeleted: { $ne: true },
    }).lean();

    if (results.length === 0) {
      throw new ValidationError('No published results found for this exam and class.');
    }

    let generatedCount = 0;

    for (const result of results) {
      // Check if a report card already exists
      const existing = await ReportCard.findOne({
        tenantId: tid,
        studentResultId: result._id,
        version: 1
      });

      if (existing) {
         if (existing.isPublished) {
             continue; // Skip published report cards
         }
         // Update existing draft
         existing.generatedByUserId = new mongoose.Types.ObjectId(generatedByUserId);
         // Simulate attendance fetch
         existing.attendanceSummary = {
             workingDays: 200,
             present: 180,
             absent: 20,
             attendancePercent: 90
         };
         await existing.save();
      } else {
         // Create new
         await ReportCard.create({
            tenantId: tid,
            studentResultId: result._id,
            studentId: result.studentId,
            examinationId: examObjId,
            academicYearId: result.academicYearId,
            attendanceSummary: { // Simulated attendance fetch
               workingDays: 200,
               present: 180,
               absent: 20,
               attendancePercent: 90
            },
            generatedByUserId: new mongoose.Types.ObjectId(generatedByUserId),
         });
      }
      generatedCount++;
    }

    return { generated: generatedCount };
  }

  /**
   * Publish a generated report card.
   */
  async publishReportCard(reportCardId: string) {
      const rc = await ReportCard.findById(reportCardId);
      if (!rc) throw new NotFoundError('Report card not found');
      
      rc.isPublished = true;
      rc.publishedAt = new Date();
      await rc.save();
      
      return rc;
  }
}
