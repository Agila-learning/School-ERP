import mongoose from 'mongoose';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import { AuditService } from '../../audit/services/audit.service';
import { NumberSequenceRepository } from '../../config/repositories/numberSequence.repository';
import AcademicEnrollment from '../../academic/models/AcademicEnrollment.model';
import StudentStatusHistory from '../models/StudentStatusHistory.model';
import TransferCertificate from '../models/TransferCertificate.model';
import AlumniProfile from '../models/AlumniProfile.model';
import StudentTransferRecord from '../models/StudentTransferRecord.model';

export class StudentLifecycleService {
  private tenantId: string;
  private sequenceRepo: NumberSequenceRepository;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.sequenceRepo = new NumberSequenceRepository(tenantId);
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  async changeStudentStatus(studentId: string, newStatus: string, reason: string, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const enrollment = await AcademicEnrollment.findOne({ tenantId: this.tid, studentId: new mongoose.Types.ObjectId(studentId), status: 'ACTIVE' }).session(session);
      if (!enrollment) throw new ValidationError('No active enrollment found for student');

      const previousStatus = enrollment.status;
      enrollment.status = newStatus as any;
      await enrollment.save({ session });

      const history = new StudentStatusHistory({
        tenantId: this.tid,
        studentId: new mongoose.Types.ObjectId(studentId),
        previousStatus,
        newStatus,
        reason,
        changedByUserId: new mongoose.Types.ObjectId(userId)
      });
      await history.save({ session });

      await session.commitTransaction();
      return { enrollment, history };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async generateTransferCertificate(studentId: string, reasonForLeaving: string, lastClassId: string, userId: string) {
    const enrollment = await AcademicEnrollment.findOne({ tenantId: this.tid, studentId: new mongoose.Types.ObjectId(studentId) }).sort({ createdAt: -1 });
    if (!enrollment) throw new NotFoundError('Enrollment not found');

    const tcNumber = await this.sequenceRepo.getNextSequence('TC');
    
    const tc = new TransferCertificate({
      tenantId: this.tid,
      studentId: new mongoose.Types.ObjectId(studentId),
      tcNumber,
      reasonForLeaving,
      lastClassId: new mongoose.Types.ObjectId(lastClassId),
      lastAttendanceDate: new Date(),
      academicInformation: `Enrolled in ${enrollment.academicYearId}`,
      status: 'GENERATED',
      issueDate: new Date(),
      requestedByUserId: new mongoose.Types.ObjectId(userId),
      issuedByUserId: new mongoose.Types.ObjectId(userId)
    });

    await tc.save();
    return tc;
  }

  async transferStudentOut(studentId: string, transferData: any, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create transfer record
      const transferRecord = new StudentTransferRecord({
        tenantId: this.tid,
        studentId: new mongoose.Types.ObjectId(studentId),
        transferType: 'OUT',
        reason: transferData.reason,
        transferDate: new Date(),
        status: 'APPROVED',
        approvedByUserId: new mongoose.Types.ObjectId(userId),
        clearanceChecklist: transferData.clearanceChecklist || []
      });
      await transferRecord.save({ session });

      // Change status to TRANSFERRED_OUT
      const enrollment = await AcademicEnrollment.findOne({ tenantId: this.tid, studentId: new mongoose.Types.ObjectId(studentId), status: 'ACTIVE' }).session(session);
      if (enrollment) {
        enrollment.status = 'TRANSFERRED' as any;
        await enrollment.save({ session });

        const history = new StudentStatusHistory({
          tenantId: this.tid,
          studentId: new mongoose.Types.ObjectId(studentId),
          previousStatus: 'ACTIVE',
          newStatus: 'TRANSFERRED',
          reason: transferData.reason,
          changedByUserId: new mongoose.Types.ObjectId(userId)
        });
        await history.save({ session });
      }

      await session.commitTransaction();
      return transferRecord;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async graduateStudent(studentId: string, graduationData: any, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const enrollment = await AcademicEnrollment.findOne({ tenantId: this.tid, studentId: new mongoose.Types.ObjectId(studentId), status: 'ACTIVE' }).session(session);
      if (enrollment) {
        enrollment.status = 'GRADUATED' as any;
        await enrollment.save({ session });

        const history = new StudentStatusHistory({
          tenantId: this.tid,
          studentId: new mongoose.Types.ObjectId(studentId),
          previousStatus: 'ACTIVE',
          newStatus: 'GRADUATED',
          reason: 'Completed final academic year',
          changedByUserId: new mongoose.Types.ObjectId(userId)
        });
        await history.save({ session });
      }

      const alumniProfile = new AlumniProfile({
        tenantId: this.tid,
        studentId: new mongoose.Types.ObjectId(studentId),
        graduationYear: graduationData.graduationYear,
        finalClassId: new mongoose.Types.ObjectId(graduationData.finalClassId),
        branchId: new mongoose.Types.ObjectId(graduationData.branchId),
        achievements: graduationData.achievements,
      });
      await alumniProfile.save({ session });

      await session.commitTransaction();
      return alumniProfile;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
