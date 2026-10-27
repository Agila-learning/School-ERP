import mongoose from 'mongoose';
import LibraryAcquisition from '../models/LibraryAcquisition.model';
import BookCopy from '../models/BookCopy.model';
import { BookCatalogue } from '../models/BookCatalogue.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class AcquisitionService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async processAcquisition(acquisitionId: string, copyDetailsList: any[]) {
    // copyDetailsList should contain: bookId, sectionId, rackId, shelfId, purchasePrice for each copy
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const acquisition = await LibraryAcquisition.findOne({
        _id: acquisitionId,
        tenantId: this.tid,
        status: 'PENDING'
      }).session(session);

      if (!acquisition) throw new NotFoundError('Pending Acquisition record not found.');

      const newCopies = [];
      const timestamp = Date.now();
      
      for (let i = 0; i < copyDetailsList.length; i++) {
        const item = copyDetailsList[i];
        
        // Generate unique Accession Number and Barcode
        const accessionNumber = `ACC-${this.tenantId.substring(0, 4)}-${timestamp}-${i}`;
        const barcode = `BAR-${this.tenantId.substring(0, 4)}-${timestamp}-${i}`;

        newCopies.push({
          tenantId: this.tid,
          bookId: new mongoose.Types.ObjectId(item.bookId),
          accessionNumber,
          barcode,
          libraryId: acquisition.libraryId,
          sectionId: item.sectionId ? new mongoose.Types.ObjectId(item.sectionId) : undefined,
          rackId: item.rackId ? new mongoose.Types.ObjectId(item.rackId) : undefined,
          shelfId: item.shelfId ? new mongoose.Types.ObjectId(item.shelfId) : undefined,
          purchaseDate: acquisition.acquiredDate,
          acquisitionSource: acquisition.source,
          purchasePrice: item.purchasePrice || (acquisition.totalCost ? acquisition.totalCost / copyDetailsList.length : 0),
          condition: 'NEW',
          status: 'AVAILABLE',
          isReferenceOnly: item.isReferenceOnly || false
        });
      }

      await BookCopy.insertMany(newCopies, { session });
      
      acquisition.status = 'PROCESSED';
      await acquisition.save({ session });

      await session.commitTransaction();
      return { success: true, count: newCopies.length };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getDonations(query: any = {}) {
    const LibraryDonation = (await import('../models/LibraryDonation.model')).default;
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    return LibraryDonation.find(filter).sort({ createdAt: -1 });
  }

  async recordDonation(data: any, recordedBy: string) {
    const LibraryDonation = (await import('../models/LibraryDonation.model')).default;
    const libraryId = data.libraryId || '60d5ec49f1b2c80015f8a002';
    const books = (data.books && data.books.length > 0) ? data.books : [{ title: data.title || 'Donated Book', quantity: data.quantity || 1, condition: 'GOOD' }];
    const totalBooks = data.totalBooks !== undefined ? data.totalBooks : books.reduce((sum: number, b: any) => sum + (Number(b.quantity) || 1), 0);
    const donationDate = data.donationDate ? new Date(data.donationDate) : new Date();

    return LibraryDonation.create({ 
      ...data, 
      libraryId,
      books,
      totalBooks,
      donationDate,
      tenantId: this.tid, 
      recordedBy: new mongoose.Types.ObjectId(recordedBy) 
    });
  }
}

