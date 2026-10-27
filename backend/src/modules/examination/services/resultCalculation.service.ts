import mongoose from 'mongoose';
import MarksEntry from '../models/MarksEntry.model';
import MarksSheet from '../models/MarksSheet.model';
import SubjectExamConfig from '../models/SubjectExamConfig.model';
import GradeSystem, { IGradeRule } from '../models/GradeSystem.model';
import SubjectResult from '../models/SubjectResult.model';
import StudentResult from '../models/StudentResult.model';
import ExaminationMaster from '../models/ExaminationMaster.model';
import Communication from '../../communication/models/Communication.model';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';

const CALC_VERSION = '1.0.0'; // Bump when grade logic changes

/**
 * ResultCalculationService
 * Idempotent: running twice produces identical results (upserts, not inserts).
 * Server-side only: grades, percentages, GPA, ranks are never accepted from clients.
 */
export class ResultCalculationService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /** Resolve grade from a grade system's rules given a percentage */
  private resolveGrade(percentage: number, rules: IGradeRule[]): IGradeRule {
    const sorted = [...rules].sort((a, b) => b.minPercentage - a.minPercentage);
    const match = sorted.find((r) => percentage >= r.minPercentage && percentage <= r.maxPercentage);
    // Fallback to lowest grade
    return match || sorted[sorted.length - 1];
  }

  /**
   * Calculate results for all students in an examination.
   * Safe to re-run (idempotent via upsert).
   */
  async calculateExamResults(examinationId: string): Promise<{ processed: number; errors: string[] }> {
    const tid = new mongoose.Types.ObjectId(this.tenantId);
    const examObjId = new mongoose.Types.ObjectId(examinationId);

    // Load all locked/verified marks sheets for this exam
    const sheets = await MarksSheet.find({
      tenantId: tid,
      examinationId: examObjId,
      status: { $in: ['LOCKED', 'VERIFIED', 'PUBLISHED'] },
      isDeleted: { $ne: true },
    });

    if (sheets.length === 0) {
      throw new ValidationError('No locked marks sheets found. Ensure all sheets are submitted and locked before calculating results.');
    }

    // Load all subject configs for this exam
    const configs = await SubjectExamConfig.find({
      tenantId: tid,
      examinationId: examObjId,
      isDeleted: { $ne: true },
    }).lean();

    const configMap = new Map();
    configs.forEach((c: any) => configMap.set(`${c.subjectId}_${c.classId}`, c));

    // Collect unique students across sheets
    const studentSet = new Set<string>();
    sheets.forEach((s: any) => {
      // We'll find students from marks entries
    });

    const errors: string[] = [];
    let processed = 0;

    for (const sheet of sheets) {
      const config = configMap.get(`${sheet.subjectId}_${sheet.classId}`);
      if (!config) {
        errors.push(`No SubjectExamConfig for subject ${sheet.subjectId} class ${sheet.classId}`);
        continue;
      }

      // Load grade system
      const gradeSystem = await GradeSystem.findById(config.gradeSystemId || null).lean() ||
        await GradeSystem.findOne({ tenantId: tid, isDefault: true }).lean();

      if (!gradeSystem) {
        errors.push(`No grade system configured for exam ${examinationId}`);
        continue;
      }

      // Get all marks entries for this sheet
      const entries = await MarksEntry.find({
        tenantId: tid,
        marksSheetId: sheet._id,
        isDeleted: { $ne: true },
      }).lean();

      // Group by student
      const studentMap = new Map<string, typeof entries>();
      entries.forEach((e: any) => {
        const key = e.studentId.toString();
        if (!studentMap.has(key)) studentMap.set(key, []);
        studentMap.get(key)!.push(e);
      });

      for (const [studentIdStr, studentEntries] of studentMap) {
        try {
          const studentId = new mongoose.Types.ObjectId(studentIdStr);

          let totalObtained = 0;
          let totalMax = config.totalMaxMarks;
          const componentBreakdown: any[] = [];
          let isAbsent = false;
          let componentFailed = false;

          for (const entry of studentEntries) {
            if (entry.attendanceStatus === 'ABSENT') {
              isAbsent = true;
              break;
            }
            const compConfig = config.components.find(
              (c: any) => c.componentId.toString() === entry.componentId.toString()
            );
            if (!compConfig) continue;

            const marks = entry.finalMarks ?? entry.marksObtained ?? 0;
            const weighted = (marks / compConfig.maxMarks) * (compConfig.weightagePercent / 100) * totalMax;

            if (config.eachComponentPassRequired && marks < compConfig.passMarks) {
              componentFailed = true;
            }

            totalObtained += weighted;
            componentBreakdown.push({
              componentId: entry.componentId,
              marksObtained: marks,
              maxMarks: compConfig.maxMarks,
              weightedMarks: parseFloat(weighted.toFixed(2)),
            });
          }

          const percentage = isAbsent ? 0 : parseFloat(((totalObtained / totalMax) * 100).toFixed(2));
          const gradeRule = isAbsent ? gradeSystem.rules[gradeSystem.rules.length - 1] : this.resolveGrade(percentage, gradeSystem.rules);
          const isPassed = !isAbsent && !componentFailed && gradeRule.isPassing && totalObtained >= config.totalPassMarks;

          // Upsert SubjectResult (idempotent)
          await SubjectResult.findOneAndUpdate(
            { tenantId: tid, examinationId: examObjId, studentId, subjectId: sheet.subjectId, version: 1 },
            {
              $set: {
                studentResultId: new mongoose.Types.ObjectId(), // Placeholder — overwritten when StudentResult is saved
                componentBreakdown,
                totalObtained: parseFloat(totalObtained.toFixed(2)),
                totalMaxMarks: totalMax,
                percentage,
                grade: gradeRule.name,
                gradePoint: gradeRule.gradePoint,
                isPassed,
                isAbsent,
                sectionId: sheet.sectionId,
                classId: sheet.classId,
              },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          processed++;
        } catch (err: any) {
          errors.push(`Student ${studentIdStr}: ${err.message}`);
        }
      }
    }

    // Now aggregate per-student totals into StudentResult
    await this.aggregateStudentResults(examinationId);

    return { processed, errors };
  }

  /** Aggregate all SubjectResults for each student into a single StudentResult */
  private async aggregateStudentResults(examinationId: string) {
    const tid = new mongoose.Types.ObjectId(this.tenantId);
    const examObjId = new mongoose.Types.ObjectId(examinationId);

    const subjectResults = await SubjectResult.find({
      tenantId: tid,
      examinationId: examObjId,
      version: 1,
      isDeleted: { $ne: true },
    }).lean();

    // Group by student
    const studentMap = new Map<string, typeof subjectResults>();
    subjectResults.forEach((sr: any) => {
      const key = sr.studentId.toString();
      if (!studentMap.has(key)) studentMap.set(key, []);
      studentMap.get(key)!.push(sr);
    });

    const gradeSystem = await GradeSystem.findOne({ tenantId: tid, isDefault: true }).lean();

    for (const [studentIdStr, srs] of studentMap) {
      const studentId = new mongoose.Types.ObjectId(studentIdStr);
      const totalObtained = srs.reduce((sum: number, s: any) => sum + s.totalObtained, 0);
      const totalMax = srs.reduce((sum: number, s: any) => sum + s.totalMaxMarks, 0);
      const percentage = parseFloat(((totalObtained / totalMax) * 100).toFixed(2));
      const passedSubjects = srs.filter((s: any) => s.isPassed).length;
      const failedSubjects = srs.filter((s: any) => !s.isPassed && !s.isAbsent).length;
      const isOverallPassed = failedSubjects === 0;

      const gradeRule = gradeSystem
        ? this.resolveGrade(percentage, gradeSystem.rules)
        : { name: 'N/A', gradePoint: 0, isPassing: false };

      const firstSr = srs[0];
      const gpa = srs.length > 0
        ? parseFloat((srs.reduce((sum: number, s: any) => sum + s.gradePoint, 0) / srs.length).toFixed(2))
        : 0;

      const upserted = await StudentResult.findOneAndUpdate(
        { tenantId: tid, examinationId: examObjId, studentId, version: 1 },
        {
          $set: {
            academicYearId: firstSr.examinationId, // overridden below
            classId: (firstSr as any).classId,
            sectionId: (firstSr as any).sectionId,
            totalObtained: parseFloat(totalObtained.toFixed(2)),
            totalMaxMarks: totalMax,
            percentage,
            overallGrade: gradeRule.name,
            overallGradePoint: gradeRule.gradePoint,
            gpa,
            passedSubjects,
            failedSubjects,
            isOverallPassed,
            status: 'CALCULATED',
            calculationVersion: CALC_VERSION,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Link subject results back to the parent student result
      await SubjectResult.updateMany(
        { tenantId: tid, examinationId: examObjId, studentId, version: 1 },
        { $set: { studentResultId: upserted._id } }
      );
    }
  }

  /**
   * Lock results to prevent further modifications.
   */
  async lockResults(examinationId: string, userId: string): Promise<number> {
    const tid = new mongoose.Types.ObjectId(this.tenantId);
    const examObjId = new mongoose.Types.ObjectId(examinationId);

    const result = await StudentResult.updateMany(
      { tenantId: tid, examinationId: examObjId, status: { $in: ['PUBLISHED', 'APPROVED', 'CALCULATED'] } },
      { $set: { status: 'LOCKED' } }
    );
    return result.modifiedCount;
  }

  /**
   * Publish results and notify students/parents
   */
  async publishResults(examinationId: string, userId: string): Promise<number> {
    const tid = new mongoose.Types.ObjectId(this.tenantId);
    const examObjId = new mongoose.Types.ObjectId(examinationId);

    const exam = await ExaminationMaster.findOne({ _id: examObjId, tenantId: tid });
    if (!exam) throw new NotFoundError('Examination not found');

    const result = await StudentResult.updateMany(
      { tenantId: tid, examinationId: examObjId, status: { $in: ['CALCULATED', 'APPROVED'] } },
      { $set: { status: 'PUBLISHED' } }
    );

    // Create Notification using the new Communication module
    if (result.modifiedCount > 0) {
      await Communication.create({
        tenantId: tid,
        title: `Results Published: ${exam.name}`,
        content: `The results for ${exam.name} have been published. Please check your portal.`,
        type: 'ACADEMIC',
        priority: 'HIGH',
        channels: ['IN_APP'],
        audienceConfig: { targetType: 'STUDENTS' },
        status: 'PENDING_APPROVAL', // Will be auto-approved or manual based on settings
        createdBy: new mongoose.Types.ObjectId(userId)
      });
    }

    return result.modifiedCount;
  }

  /**
   * Get student results (for Student / Parent view)
   */
  async getStudentResults(studentId: string) {
    const tid = new mongoose.Types.ObjectId(this.tenantId);
    const studObjId = new mongoose.Types.ObjectId(studentId);

    // Only return published results for students/parents
    const results = await StudentResult.find({
      tenantId: tid,
      studentId: studObjId,
      status: 'PUBLISHED',
      isDeleted: { $ne: true }
    }).populate('examinationId', 'name startDate endDate').lean();

    // Attach subject results
    for (const res of results) {
      const subjects = await SubjectResult.find({
        tenantId: tid,
        studentResultId: res._id,
        isDeleted: { $ne: true }
      }).populate('subjectId', 'name code').lean();

      (res as any).subjects = subjects.map((s: any) => ({
        _id: s._id,
        subjectName: s.subjectId?.name || 'Unknown',
        subjectCode: s.subjectId?.code || '',
        obtained: s.totalObtained,
        max: s.totalMaxMarks,
        percentage: s.percentage,
        grade: s.grade,
        isPassed: s.isPassed,
        breakdown: s.componentBreakdown
      }));
    }

    return results;
  }

  /**
   * Get all results for a specific examination (Admin/Teacher view)
   */
  async getAllResults(examinationId: string) {
    const tid = new mongoose.Types.ObjectId(this.tenantId);
    const examObjId = new mongoose.Types.ObjectId(examinationId);

    const results = await StudentResult.find({
      tenantId: tid,
      examinationId: examObjId,
      isDeleted: { $ne: true }
    }).populate('studentId', 'firstName lastName admissionNumber rollNumber').lean();

    // Attach subject results
    for (const res of results) {
      const subjects = await SubjectResult.find({
        tenantId: tid,
        studentResultId: res._id,
        isDeleted: { $ne: true }
      }).populate('subjectId', 'name code').lean();

      (res as any).subjects = subjects.map((s: any) => ({
        _id: s._id,
        subjectName: s.subjectId?.name || 'Unknown',
        subjectCode: s.subjectId?.code || '',
        obtained: s.totalObtained,
        max: s.totalMaxMarks,
        percentage: s.percentage,
        grade: s.grade,
        isPassed: s.isPassed,
        breakdown: s.componentBreakdown
      }));
    }

    return results;
  }
}
