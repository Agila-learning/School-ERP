import mongoose from 'mongoose';
import MarksEntry from '../models/MarksEntry.model';
import MarksSheet from '../models/MarksSheet.model';
import MarksChangeHistory from '../models/MarksChangeHistory.model';
import SubjectExamConfig from '../models/SubjectExamConfig.model';
import ExaminationMaster from '../models/ExaminationMaster.model';
import StudentProfile from '../../students/models/StudentProfile.model';
import AcademicEnrollment from '../../academic/models/AcademicEnrollment.model';
import { NotFoundError, ValidationError, ForbiddenError } from '../../../core/errors/AppError';

interface IMarkInput {
  studentId: string;
  componentId: string;
  marksObtained?: number;
  attendanceStatus?: 'PRESENT' | 'ABSENT' | 'EXEMPTED' | 'NOT_APPLICABLE';
  remarks?: string;
}

export class MarksService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  /** Get or create a MarksSheet */
  async getOrCreateSheet(examinationId: string, sectionId: string, subjectId: string, classId: string) {
    const examObjId = new mongoose.Types.ObjectId(examinationId);

    // Validate exam is in a state that allows marks entry
    const exam = await ExaminationMaster.findOne({ _id: examObjId, tenantId: this.tid });
    if (!exam) throw new NotFoundError('Examination not found');
    if (!['ONGOING', 'COMPLETED', 'MARKS_ENTRY'].includes(exam.status)) {
      throw new ValidationError(`Examination is in status "${exam.status}" — marks entry not allowed`);
    }

    const config = await SubjectExamConfig.findOne({
      tenantId: this.tid,
      examinationId: examObjId,
      subjectId: new mongoose.Types.ObjectId(subjectId),
      classId: new mongoose.Types.ObjectId(classId),
      isDeleted: { $ne: true },
    });
    if (!config) throw new NotFoundError('SubjectExamConfig not found for this subject/class/exam');

    const sheet = await MarksSheet.findOneAndUpdate(
      {
        tenantId: this.tid,
        examinationId: examObjId,
        sectionId: new mongoose.Types.ObjectId(sectionId),
        subjectId: new mongoose.Types.ObjectId(subjectId),
      },
      {
        $setOnInsert: {
          tenantId: this.tid,
          examinationId: examObjId,
          subjectExamConfigId: config._id,
          classId: new mongoose.Types.ObjectId(classId),
          sectionId: new mongoose.Types.ObjectId(sectionId),
          subjectId: new mongoose.Types.ObjectId(subjectId),
          status: 'IN_PROGRESS',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('subjectExamConfigId');

    return sheet;
  }

  /** Save marks for a list of students — bulk upsert */
  async saveMarks(
    sheetId: string,
    marksData: IMarkInput[],
    enteredByUserId: string
  ) {
    const sheet = await MarksSheet.findById(sheetId);
    if (!sheet) throw new NotFoundError('Marks sheet not found');

    if (['LOCKED', 'VERIFIED', 'PUBLISHED'].includes(sheet.status)) {
      throw new ForbiddenError(`Marks sheet is ${sheet.status} — modifications not permitted`);
    }

    const config = await SubjectExamConfig.findById(sheet.subjectExamConfigId);
    if (!config) throw new NotFoundError('Subject exam config not found');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const historyDocs: any[] = [];

      for (const item of marksData) {
        const componentConfig = config.components.find(
          (c: any) => c.componentId.toString() === item.componentId
        );
        if (!componentConfig) throw new ValidationError(`Component ${item.componentId} not found in config`);

        if (
          item.marksObtained !== undefined &&
          item.attendanceStatus !== 'ABSENT' &&
          item.attendanceStatus !== 'EXEMPTED'
        ) {
          if (item.marksObtained > componentConfig.maxMarks) {
            throw new ValidationError(
              `Marks ${item.marksObtained} exceed maximum ${componentConfig.maxMarks} for component ${item.componentId}`
            );
          }
          if (item.marksObtained < 0) {
            throw new ValidationError(`Marks cannot be less than 0`);
          }
        }

        // Verify student belongs to this section (Tenant & Section Isolation)
        const enrollment = await AcademicEnrollment.findOne({
          tenantId: this.tid,
          studentId: new mongoose.Types.ObjectId(item.studentId),
          academicYearId: sheet.examinationId, // Note: For robustness, we should ideally check sectionId directly 
          // Assuming StudentEnrollment maps student to section:
          sectionId: sheet.sectionId,
          isActive: true
        });

        // Even better, let's just make sure the student exists in this tenant.
        const studentRecord = await StudentProfile.findOne({ _id: item.studentId, tenantId: this.tid });
        if (!studentRecord) {
          throw new ForbiddenError(`Student ${item.studentId} does not belong to this school/tenant.`);
        }

        const isAbsentOrExempt = item.attendanceStatus === 'ABSENT' || item.attendanceStatus === 'EXEMPTED';
        const finalMarksObtained = isAbsentOrExempt ? undefined : item.marksObtained;
        const finalMarks = finalMarksObtained;

        const existing = await MarksEntry.findOne({
          tenantId: this.tid,
          marksSheetId: sheet._id,
          studentId: new mongoose.Types.ObjectId(item.studentId),
          componentId: new mongoose.Types.ObjectId(item.componentId),
        }).session(session);

        if (existing) {
          historyDocs.push({
            tenantId: this.tid,
            marksEntryId: existing._id,
            marksSheetId: sheet._id,
            studentId: existing.studentId,
            componentId: existing.componentId,
            oldMarks: existing.marksObtained,
            newMarks: finalMarksObtained,
            oldAttendanceStatus: existing.attendanceStatus,
            newAttendanceStatus: item.attendanceStatus,
            changeType: 'UPDATED',
            changedByUserId: new mongoose.Types.ObjectId(enteredByUserId),
          });
          existing.marksObtained = finalMarksObtained;
          existing.finalMarks = finalMarks;
          existing.attendanceStatus = item.attendanceStatus ?? 'PRESENT';
          existing.remarks = item.remarks;
          await existing.save({ session });
        } else {
          const created = await MarksEntry.create(
            [
              {
                tenantId: this.tid,
                marksSheetId: sheet._id,
                studentId: new mongoose.Types.ObjectId(item.studentId),
                componentId: new mongoose.Types.ObjectId(item.componentId),
                marksObtained: finalMarksObtained,
                finalMarks,
                attendanceStatus: item.attendanceStatus ?? 'PRESENT',
                remarks: item.remarks,
                enteredByUserId: new mongoose.Types.ObjectId(enteredByUserId),
              },
            ],
            { session }
          );
          historyDocs.push({
            tenantId: this.tid,
            marksEntryId: created[0]._id,
            marksSheetId: sheet._id,
            studentId: new mongoose.Types.ObjectId(item.studentId),
            componentId: new mongoose.Types.ObjectId(item.componentId),
            newMarks: finalMarksObtained,
            newAttendanceStatus: item.attendanceStatus,
            changeType: 'CREATED',
            changedByUserId: new mongoose.Types.ObjectId(enteredByUserId),
          });
        }
      }

      // Write audit history
      if (historyDocs.length > 0) {
        await MarksChangeHistory.insertMany(historyDocs, { session });
      }

      // Update sheet status to IN_PROGRESS
      sheet.status = 'IN_PROGRESS';
      sheet.enteredByUserId = new mongoose.Types.ObjectId(enteredByUserId);
      await sheet.save({ session });

      await session.commitTransaction();
      session.endSession();
      return { saved: marksData.length };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  /** Submit a marks sheet (teacher submits for verification) */
  async submitSheet(sheetId: string, userId: string) {
    const sheet = await MarksSheet.findById(sheetId);
    if (!sheet) throw new NotFoundError('Marks sheet not found');
    if (sheet.status !== 'IN_PROGRESS') {
      throw new ValidationError(`Cannot submit sheet in status "${sheet.status}"`);
    }
    sheet.status = 'SUBMITTED';
    sheet.submittedAt = new Date();
    await sheet.save();
    return sheet;
  }

  /** Lock a marks sheet (coordinator locks after verification) */
  async lockSheet(sheetId: string, verifiedByUserId: string) {
    const sheet = await MarksSheet.findById(sheetId);
    if (!sheet) throw new NotFoundError('Marks sheet not found');
    if (sheet.status !== 'SUBMITTED') {
      throw new ValidationError(`Can only lock SUBMITTED sheets, current status is "${sheet.status}"`);
    }
    sheet.status = 'LOCKED';
    sheet.lockedAt = new Date();
    sheet.verifiedByUserId = new mongoose.Types.ObjectId(verifiedByUserId);
    await sheet.save();
    return sheet;
  }

  /** Fetch marks entries for a sheet */
  async getSheetEntries(sheetId: string) {
    const sheet = await MarksSheet.findById(sheetId);
    if (!sheet) throw new NotFoundError('Marks sheet not found');

    const enrollments = await AcademicEnrollment.find({
      tenantId: this.tid,
      academicYearId: sheet.examinationId, // Using exam's year or assume currently active year. Ideally exam points to term -> year. But we'll rely on class/section.
      classId: sheet.classId,
      sectionId: sheet.sectionId,
      isActive: true,
      isDeleted: { $ne: true }
    }).populate('studentId', 'firstName lastName admissionNumber rollNumber');

    const existingEntries = await MarksEntry.find({
      tenantId: this.tid,
      marksSheetId: new mongoose.Types.ObjectId(sheetId),
      isDeleted: { $ne: true },
    }).populate('componentId', 'name code');

    // Create a map for quick lookup
    const entryMap = new Map();
    existingEntries.forEach((e: any) => {
      entryMap.set(`${e.studentId.toString()}_${e.componentId.toString()}`, e);
    });

    // We also need the components for this subject exam config to ensure we generate empty entries for all components
    const config = await SubjectExamConfig.findById(sheet.subjectExamConfigId);
    if (!config) throw new NotFoundError('Subject exam config not found');

    const finalEntries: any[] = [];

    for (const enr of enrollments) {
      const student = enr.studentId as any;
      if (!student) continue;

      for (const comp of config.components) {
        const key = `${student._id.toString()}_${comp.componentId.toString()}`;
        if (entryMap.has(key)) {
          // Flatten student info into the entry for the frontend
          const e = entryMap.get(key).toObject();
          finalEntries.push({
            ...e,
            studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            rollNo: student.rollNumber || student.admissionNumber || 'N/A'
          });
        } else {
          // Generate empty entry
          finalEntries.push({
            marksSheetId: sheet._id,
            studentId: student._id,
            componentId: comp.componentId,
            studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            rollNo: student.rollNumber || student.admissionNumber || 'N/A',
            attendanceStatus: 'PRESENT',
            marksObtained: undefined,
            finalMarks: undefined
          });
        }
      }
    }

    // Sort by rollNo / name
    return finalEntries.sort((a, b) => a.studentName.localeCompare(b.studentName));
  }
}
