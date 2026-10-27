import mongoose from 'mongoose';
import HostelApplication from '../models/HostelApplication.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';
import { FinanceService } from '../../finance/services/finance.service';
import Invoice from '../../finance/models/Invoice.model';

export class HostelApplicationService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getApplications() {
    return HostelApplication.find({ tenantId: this.tid, isDeleted: { $ne: true } })
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('preferredHostelId', 'name');
  }

  async submitApplication(data: any) {
    const existing = await HostelApplication.findOne({
      tenantId: this.tid,
      studentId: new mongoose.Types.ObjectId(data.studentId),
      academicYearId: new mongoose.Types.ObjectId(data.academicYearId),
      status: { $in: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'WAITLISTED'] }
    });

    if (existing) {
      throw new ValidationError('An active application already exists for this student for the given academic year.');
    }

    return HostelApplication.create({ ...data, tenantId: this.tid, status: 'SUBMITTED' });
  }

  async updateStatus(applicationId: string, status: string, reviewerId: string, notes?: string) {
    const app = await HostelApplication.findOne({ _id: new mongoose.Types.ObjectId(applicationId), tenantId: this.tid });
    if (!app) throw new NotFoundError('Application not found');

    app.status = status as any;
    app.reviewedByUserId = new mongoose.Types.ObjectId(reviewerId);
    if (notes) app.reviewNotes = notes;

    await app.save();
    return app;
  }

  async approveAndGenerateInvoice(applicationId: string, reviewerId: string, feeAmount: number) {
    const app = await HostelApplication.findOne({ _id: new mongoose.Types.ObjectId(applicationId), tenantId: this.tid });
    if (!app) throw new NotFoundError('Application not found');
    if (app.status !== 'SUBMITTED' && app.status !== 'UNDER_REVIEW' && app.status !== 'WAITLISTED') {
      throw new ValidationError(`Cannot approve application from status ${app.status}`);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      app.status = 'APPROVED';
      app.reviewedByUserId = new mongoose.Types.ObjectId(reviewerId);
      await app.save({ session });

      // Generate Invoice
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

      const invoiceItem = {
        feeHeadId: new mongoose.Types.ObjectId(), // Virtual for now, ideally linked to a FeeHead
        amount: feeAmount,
        discountAmount: 0,
        taxAmount: 0,
        netAmount: feeAmount
      };

      const [invoice] = await Invoice.create([{
        tenantId: this.tid,
        branchId: app.branchId,
        studentId: app.studentId,
        academicYearId: app.academicYearId,
        invoiceNumber: `HSTL-FEE-${Date.now()}`,
        issuedAt: new Date(),
        dueDate,
        subTotal: feeAmount,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: feeAmount,
        amountPaid: 0,
        balanceDue: feeAmount,
        status: 'ISSUED',
        items: [invoiceItem]
      }], { session });

      await session.commitTransaction();
      return { application: app, invoice };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
