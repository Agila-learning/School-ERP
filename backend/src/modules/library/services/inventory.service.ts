import mongoose from 'mongoose';
import LibraryTransfer from '../models/LibraryTransfer.model';
import LibraryDisposal from '../models/LibraryDisposal.model';
import BookCopy from '../models/BookCopy.model';
import LibraryStockAudit from '../models/LibraryStockAudit.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class LibraryInventoryService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async requestTransfer(data: any) {
    const transfer = await LibraryTransfer.create({
      ...data,
      tenantId: this.tid,
      status: 'REQUESTED'
    });
    return transfer;
  }

  async processTransfer(transferId: string, action: 'DISPATCH' | 'RECEIVE' | 'REJECT', userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const transfer = await LibraryTransfer.findOne({ _id: transferId, tenantId: this.tid }).session(session);
      if (!transfer) throw new NotFoundError('Transfer record not found.');

      if (action === 'DISPATCH') {
        if (transfer.status !== 'REQUESTED' && transfer.status !== 'APPROVED') throw new ValidationError('Invalid status for dispatch.');
        transfer.status = 'IN_TRANSIT';
        transfer.dispatchDate = new Date();
        transfer.dispatchedByUserId = new mongoose.Types.ObjectId(userId);
      } else if (action === 'RECEIVE') {
        if (transfer.status !== 'IN_TRANSIT') throw new ValidationError('Invalid status for receive.');
        transfer.status = 'RECEIVED';
        transfer.receiveDate = new Date();
        transfer.receivedByUserId = new mongoose.Types.ObjectId(userId);

        // Update book copy libraries
        await BookCopy.updateMany(
          { _id: { $in: transfer.copyIds }, tenantId: this.tid },
          { $set: { libraryId: transfer.toLibraryId, sectionId: null, rackId: null, shelfId: null } },
          { session }
        );
      } else if (action === 'REJECT') {
        transfer.status = 'REJECTED';
      }

      await transfer.save({ session });
      await session.commitTransaction();
      return transfer;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async processDisposal(data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const copy = await BookCopy.findOne({ _id: data.copyId, tenantId: this.tid }).session(session);
      if (!copy) throw new NotFoundError('Book copy not found.');

      const disposal = await LibraryDisposal.create([{
        tenantId: this.tid,
        libraryId: copy.libraryId,
        copyId: copy._id,
        reason: data.reason,
        conditionPrior: copy.condition,
        requestedByUserId: new mongoose.Types.ObjectId(data.requestedByUserId),
        status: 'DISPOSED',
        disposalDate: new Date(),
        notes: data.notes
      }], { session });

      copy.status = 'DISCARDED'; // Or 'LOST' if reason is LOST
      if (data.reason === 'LOST') copy.status = 'LOST';
      await copy.save({ session });

      await session.commitTransaction();
      return disposal[0];
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async startStockVerification(libraryId: string, auditorId: string) {
    const validLibId = libraryId && mongoose.Types.ObjectId.isValid(libraryId) ? new mongoose.Types.ObjectId(libraryId) : new mongoose.Types.ObjectId('60d5ec49f1b2c80015f8a002');
    const validAuditorId = auditorId && mongoose.Types.ObjectId.isValid(auditorId) ? new mongoose.Types.ObjectId(auditorId) : this.tid;

    const expectedBooksCount = await BookCopy.countDocuments({
      tenantId: this.tid,
      status: { $in: ['AVAILABLE', 'ISSUED', 'RESERVED', 'UNDER_REPAIR'] }
    });

    const audit = await LibraryStockAudit.create({
      tenantId: this.tid,
      libraryId: validLibId,
      auditorId: validAuditorId,
      startedBy: validAuditorId,
      startedAt: new Date(),
      expectedBooksCount,
      status: 'IN_PROGRESS'
    });

    return audit;
  }

  async finalizeStockVerification(auditId: string, data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const audit = await LibraryStockAudit.findOne({
        _id: auditId,
        tenantId: this.tid,
        status: 'IN_PROGRESS'
      }).session(session);

      if (!audit) throw new NotFoundError('In-progress stock verification not found.');

      audit.scannedBooksCount = data.scannedBooksCount || 0;
      audit.missingCopyIds = data.missingCopyIds || [];
      audit.missingBooksCount = audit.missingCopyIds.length;
      audit.damagedCopyIds = data.damagedCopyIds || [];
      audit.damagedBooksCount = audit.damagedCopyIds.length;
      audit.notes = data.notes;
      audit.status = 'COMPLETED';

      if (audit.missingCopyIds.length > 0) {
        await BookCopy.updateMany(
          { _id: { $in: audit.missingCopyIds }, tenantId: this.tid },
          { $set: { status: 'MISSING' } },
          { session }
        );
      }

      if (audit.damagedCopyIds.length > 0) {
        await BookCopy.updateMany(
          { _id: { $in: audit.damagedCopyIds }, tenantId: this.tid },
          { $set: { status: 'DAMAGED' } },
          { session }
        );
      }

      await audit.save({ session });
      await session.commitTransaction();
      return audit;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getStockVerifications(query: any = {}) {
    const LibraryStockAudit = (await import('../models/LibraryStockAudit.model')).default;
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query.libraryId) filter.libraryId = new mongoose.Types.ObjectId(query.libraryId as string);
    return LibraryStockAudit.find(filter)
      .populate('startedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
  }
}

