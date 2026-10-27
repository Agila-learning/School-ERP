import mongoose from 'mongoose';
import LibraryFine from '../models/LibraryFine.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import FeeHead from '../../finance/models/FeeHead.model';
import Invoice from '../../finance/models/Invoice.model';
import { FinanceService } from '../../finance/services/finance.service';

export class LibraryFineService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getFines(userId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    return LibraryFine.find(filter)
      .populate('userId', 'firstName lastName admissionNumber')
      .populate('copyId', 'accessionNumber');
  }

  async generateFine(data: any) {
    // data: { academicYearId, userId, issueId?, copyId, fineType, description, amount }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const fine = await LibraryFine.create([{
        ...data,
        tenantId: this.tid,
        waivedAmount: 0,
        netAmount: data.amount,
        status: 'PENDING'
      }], { session });

      // Trigger Finance Integration here...
      // await FinanceService.createFeeDemand({ amount: data.amount, category: 'LIBRARY', referenceId: fine[0]._id });

      await session.commitTransaction();
      return fine[0];
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async waiveFine(fineId: string, waivedAmount: number, userId: string, reason: string) {
    const fine = await LibraryFine.findOne({ _id: fineId, tenantId: this.tid, isDeleted: { $ne: true } });
    if (!fine) throw new NotFoundError('Fine not found');
    if (fine.status === 'PAID') throw new ValidationError('Cannot waive a fully paid fine.');

    fine.waivedAmount = waivedAmount;
    fine.netAmount = Math.max(0, fine.amount - waivedAmount);
    fine.waivedByUserId = new mongoose.Types.ObjectId(userId);
    fine.waiveReason = reason;

    if (fine.netAmount === 0) fine.status = 'WAIVED';

    await fine.save();
    return fine;
  }

  async initiateFinePayment(fineId: string, studentId: string, branchId: string, academicYearId: string) {
    const fine = await LibraryFine.findOne({ _id: fineId, tenantId: this.tid, isDeleted: { $ne: true } });
    if (!fine) throw new NotFoundError('Fine not found');
    if (fine.status === 'PAID') throw new ValidationError('Fine is already paid.');
    if (fine.netAmount <= 0) throw new ValidationError('Fine amount is zero.');

    let feeHead = await FeeHead.findOne({ tenantId: this.tid, name: 'Library Fine' });
    if (!feeHead) {
      feeHead = await FeeHead.create({
        tenantId: this.tid,
        name: 'Library Fine',
        code: 'LIB_FINE',
        description: 'Automated Library Fine',
        category: 'MISCELLANEOUS',
        isTaxable: false
      });
    }

    const invoiceNumber = `LIB-INV-${Date.now()}`;
    const invoice = await Invoice.create({
      tenantId: this.tid,
      branchId: new mongoose.Types.ObjectId(branchId),
      academicYearId: new mongoose.Types.ObjectId(academicYearId),
      studentId: new mongoose.Types.ObjectId(studentId),
      invoiceNumber,
      items: [{
        feeHeadId: feeHead._id,
        amount: fine.netAmount,
        discountAmount: 0,
        taxAmount: 0,
        netAmount: fine.netAmount
      }],
      subTotal: fine.netAmount,
      totalDiscount: 0,
      totalTax: 0,
      grandTotal: fine.netAmount,
      amountPaid: 0,
      balanceDue: fine.netAmount,
      dueDate: new Date(),
      status: 'ISSUED',
      issuedAt: new Date()
    });

    fine.invoiceId = invoice._id;
    await fine.save();

    const financeService = new FinanceService(this.tenantId);
    return financeService.initiateOnlinePayment(invoice._id.toString(), fine.netAmount);
  }

  async createFine(data: any) {
    return LibraryFine.create({ ...data, tenantId: this.tid });
  }

  async recordFinePayment(fineId: string, data: any, paidBy: string) {
    const fine = await LibraryFine.findOne({ _id: fineId, tenantId: this.tid });
    if (!fine) throw new NotFoundError('Fine not found');
    fine.paidAmount = (fine.paidAmount || 0) + (data.amount || 0);
    if (fine.paidAmount >= fine.amount) fine.status = 'PAID';
    else fine.status = 'PARTIALLY_PAID';
    await fine.save();
    return fine;
  }

  async requestFineWaiver(fineId: string, data: any, requestedBy: string) {
    const { LibraryFineWaiver } = await import('../models/LibraryFineWaiver.model');
    const fine = await LibraryFine.findOne({ _id: fineId, tenantId: this.tid });
    if (!fine) throw new NotFoundError('Fine not found');
    return LibraryFineWaiver.create({
      tenantId: this.tid,
      fineId: fine._id,
      libraryId: fine.libraryId,
      requestedBy: new mongoose.Types.ObjectId(requestedBy),
      requestedByType: 'MEMBER',
      reason: data.reason,
      waiverAmount: data.waiverAmount || fine.amount,
      waiverType: data.waiverType || 'FULL',
    });
  }

  async getFineWaivers(query: any = {}) {
    const { LibraryFineWaiver } = await import('../models/LibraryFineWaiver.model');
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query.status) filter.status = query.status;
    return LibraryFineWaiver.find(filter)
      .populate('requestedBy', 'firstName lastName')
      .populate('fineId')
      .sort({ createdAt: -1 });
  }

  async reviewFineWaiver(waiverId: string, data: any, reviewedBy: string) {
    const { LibraryFineWaiver } = await import('../models/LibraryFineWaiver.model');
    const waiver = await LibraryFineWaiver.findOne({ _id: waiverId, tenantId: this.tid });
    if (!waiver) throw new NotFoundError('Waiver not found');
    waiver.status = data.approved ? 'APPROVED' : 'REJECTED';
    waiver.reviewedBy = new mongoose.Types.ObjectId(reviewedBy);
    waiver.reviewedAt = new Date();
    waiver.reviewNotes = data.notes;
    if (data.approved) {
      waiver.approvedAt = new Date();
      const fine = await LibraryFine.findById(waiver.fineId);
      if (fine) {
        fine.waivedAmount = (fine.waivedAmount || 0) + waiver.waiverAmount;
        if (fine.waivedAmount >= fine.amount) fine.status = 'WAIVED';
        await fine.save();
      }
    }
    await waiver.save();
    return waiver;
  }
}

