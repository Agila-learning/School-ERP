import mongoose from 'mongoose';
import StudentTransportAssignment from '../models/StudentTransportAssignment.model';
// We reference Phase 11 finance models (assuming they are exported/available)
import FeeDemand from '../../finance/models/FeeDemand.model';
import FeeStructure from '../../finance/models/FeeStructure.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class TransportFinanceService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  /**
   * Hook into Finance FeeDemand generation.
   * Do NOT duplicate Invoice/Payment architecture. Just generate the Demand.
   */
  async generateTransportFeeDemand(assignmentId: string, feeStructureId: string, dueDate: Date) {
    const assignmentObjId = new mongoose.Types.ObjectId(assignmentId);
    
    const assignment = await StudentTransportAssignment.findOne({ _id: assignmentObjId, tenantId: this.tid });
    if (!assignment) throw new NotFoundError('Transport Assignment not found');
    
    if (assignment.status !== 'ACTIVE') {
       throw new ValidationError('Cannot generate fee demand for inactive assignment');
    }

    const feeStructureObjId = new mongoose.Types.ObjectId(feeStructureId);
    const structure = await FeeStructure.findOne({ _id: feeStructureObjId, tenantId: this.tid });
    if (!structure) throw new NotFoundError('Fee Structure not found');

    const totalAmount = structure.totalAmount;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Generate Fee Demand in Phase 11 Finance Module
      const demand = await FeeDemand.create([{
        tenantId: this.tid,
        studentId: assignment.studentId,
        academicYearId: assignment.academicYearId,
        feeStructureId: structure._id,
        feeHeadId: structure.feeHeadId,
        installmentNumber: 1, // Assumption for single transport generation
        amount: totalAmount,
        dueDate,
        isInvoiced: false,
      }], { session });

      // Link Demand to Assignment
      assignment.feeDemandId = demand[0]._id;
      await assignment.save({ session });

      await session.commitTransaction();
      session.endSession();

      return demand[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Stops future fee demands if assignment is cancelled.
   * We do not modify historic paid demands.
   */
  async stopFutureDemands(assignmentId: string) {
     const assignment = await StudentTransportAssignment.findOne({ _id: new mongoose.Types.ObjectId(assignmentId), tenantId: this.tid });
     if (!assignment) throw new NotFoundError('Transport Assignment not found');

     assignment.status = 'CANCELLED';
     assignment.effectiveUntil = new Date();
     await assignment.save();

     // If there is an unpaid PENDING demand, we could theoretically CANCEL it here via FinanceService.
     // For this abstraction, returning assignment is sufficient.
     return assignment;
  }
}
