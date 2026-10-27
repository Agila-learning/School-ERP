import mongoose from 'mongoose';
import Library from '../models/Library.model';
import { LibrarySection, LibraryRack, LibraryShelf } from '../models/LibraryLocation.model';
import LibraryMembership from '../models/LibraryMembership.model';
import BookCopy from '../models/BookCopy.model';
import { BookIssue } from '../models/Circulation.model';
import LibraryFine from '../models/LibraryFine.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class LibraryService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getLibraries(branchId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (branchId) filter.branchId = new mongoose.Types.ObjectId(branchId);
    return Library.find(filter).populate('librarianId', 'firstName lastName');
  }

  async getDashboardStats() {
    const totalCopies = await BookCopy.countDocuments({ tenantId: this.tid, isDeleted: { $ne: true } });
    const availableCopies = await BookCopy.countDocuments({ tenantId: this.tid, status: 'AVAILABLE', isDeleted: { $ne: true } });
    const issuedCopies = await BookCopy.countDocuments({ tenantId: this.tid, status: 'ISSUED', isDeleted: { $ne: true } });
    const reservedCopies = await BookCopy.countDocuments({ tenantId: this.tid, status: 'RESERVED', isDeleted: { $ne: true } });
    const overdueBooks = await BookIssue.countDocuments({ tenantId: this.tid, status: 'OVERDUE', isDeleted: { $ne: true } });
    
    const fines = await LibraryFine.aggregate([
      { $match: { tenantId: this.tid, isDeleted: { $ne: true } } },
      { $group: { _id: '$status', totalAmount: { $sum: '$amount' }, collectedAmount: { $sum: '$paidAmount' } } }
    ]);
    
    let totalFines = 0;
    let collectedFines = 0;
    fines.forEach((f: any) => {
      totalFines += f.totalAmount;
      collectedFines += f.collectedAmount;
    });

    return {
      totalCopies,
      availableCopies,
      issuedCopies,
      reservedCopies,
      overdueBooks,
      finesCollected: collectedFines,
      pendingFines: totalFines - collectedFines
    };
  }

  async createLibrary(data: any) {
    return Library.create({ ...data, tenantId: this.tid });
  }

  // --- Location Hierarchy ---
  async getSections(libraryId: string) {
    return LibrarySection.find({ tenantId: this.tid, libraryId: new mongoose.Types.ObjectId(libraryId), isDeleted: { $ne: true } });
  }

  async createSection(libraryId: string, data: any) {
    return LibrarySection.create({ ...data, libraryId, tenantId: this.tid });
  }

  async getRacks(sectionId: string) {
    return LibraryRack.find({ tenantId: this.tid, sectionId: new mongoose.Types.ObjectId(sectionId), isDeleted: { $ne: true } });
  }

  async createRack(libraryId: string, sectionId: string, data: any) {
    return LibraryRack.create({ ...data, libraryId, sectionId, tenantId: this.tid });
  }

  async getShelves(rackId: string) {
    return LibraryShelf.find({ tenantId: this.tid, rackId: new mongoose.Types.ObjectId(rackId), isDeleted: { $ne: true } });
  }

  async createShelf(libraryId: string, rackId: string, data: any) {
    return LibraryShelf.create({ ...data, libraryId, rackId, tenantId: this.tid });
  }

  // --- Membership ---
  async createMembership(data: any) {
    // Check if membership already exists
    const existing = await LibraryMembership.findOne({
      tenantId: this.tid,
      userId: new mongoose.Types.ObjectId(data.userId),
      academicYearId: new mongoose.Types.ObjectId(data.academicYearId),
      status: 'ACTIVE'
    });
    if (existing) throw new ValidationError('Active membership already exists for this user in this academic year.');

    // Ensure memberType and limits are provided. In a real system, these would be fetched from a LibrarySettings ruleset.
    return LibraryMembership.create({ ...data, tenantId: this.tid });
  }

  async getMembership(membershipId: string) {
    return LibraryMembership.findOne({ _id: membershipId, tenantId: this.tid }).populate('userId', 'firstName lastName email rollNumber');
  }

  async getAnalytics(query: any = {}) {
    const [mostBorrowed, categoryStats, overdueTrend] = await Promise.all([
      BookIssue.aggregate([
        { $match: { tenantId: this.tid, isDeleted: { $ne: true } } },
        { $group: { _id: '$bookId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      BookCopy.aggregate([
        { $match: { tenantId: this.tid, isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      BookIssue.aggregate([
        { $match: { tenantId: this.tid, status: 'OVERDUE', isDeleted: { $ne: true } } },
        { $group: { _id: { $month: '$dueDate' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } },
      ]),
    ]);
    return { mostBorrowed, categoryStats, overdueTrend };
  }
}
