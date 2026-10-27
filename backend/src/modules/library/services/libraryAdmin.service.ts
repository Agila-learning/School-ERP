import mongoose from 'mongoose';
import LibraryVendor from '../models/LibraryVendor.model';
import LibraryPurchaseRequest from '../models/LibraryPurchaseRequest.model';
import { NotFoundError, ValidationError, ForbiddenError } from '../../../core/errors/AppError';
import { BookIssue } from '../models/Circulation.model';
import BookCopy from '../models/BookCopy.model';

export class LibraryAdminService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  // ---- VENDORS ----
  async getVendors(status?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (status) q.status = status;
    return LibraryVendor.find(q).sort({ name: 1 });
  }

  async createVendor(data: any, userId: string) {
    return LibraryVendor.create({ ...data, tenantId: this.tid, createdBy: new mongoose.Types.ObjectId(userId) });
  }

  async updateVendor(vendorId: string, data: any) {
    const vendor = await LibraryVendor.findOneAndUpdate(
      { _id: vendorId, tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!vendor) throw new NotFoundError('Vendor not found.');
    return vendor;
  }

  // ---- PURCHASE REQUESTS ----
  async getPurchaseRequests(status?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (status) q.status = status;
    return LibraryPurchaseRequest.find(q)
      .populate('requestedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('vendorId', 'name')
      .sort({ createdAt: -1 });
  }

  async createPurchaseRequest(data: any, userId: string) {
    const requestNumber = `LBPR-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    return LibraryPurchaseRequest.create({
      ...data,
      tenantId: this.tid,
      requestNumber,
      requestedBy: new mongoose.Types.ObjectId(userId),
      requestedDate: new Date(),
      status: 'PENDING_APPROVAL',
    });
  }

  async approvePurchaseRequest(requestId: string, userId: string, approved: boolean, reason?: string) {
    const request = await LibraryPurchaseRequest.findOne({ _id: requestId, tenantId: this.tid });
    if (!request) throw new NotFoundError('Purchase request not found.');
    if (request.status !== 'PENDING_APPROVAL') throw new ValidationError('Request is not pending approval.');

    request.status = approved ? 'APPROVED' : 'REJECTED';
    request.approvedBy = new mongoose.Types.ObjectId(userId);
    request.approvedDate = new Date();
    if (!approved && reason) request.rejectionReason = reason;
    await request.save();
    return request;
  }

  // ---- OVERDUE ----
  async getOverdueIssues() {
    const now = new Date();
    const overdue = await BookIssue.find({
      tenantId: this.tid,
      status: { $in: ['ACTIVE', 'RENEWED'] },
      dueDate: { $lt: now },
      isDeleted: { $ne: true }
    })
      .populate('userId', 'firstName lastName email')
      .populate('bookId', 'title')
      .populate('copyId', 'accessionNumber barcode')
      .sort({ dueDate: 1 });

    const bands = {
      dueToday: [] as any[],
      overdue1to7: [] as any[],
      overdue8to30: [] as any[],
      overdue30plus: [] as any[],
    };

    overdue.forEach((issue: any) => {
      const diffDays = Math.ceil((now.getTime() - new Date(issue.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) bands.dueToday.push(issue);
      else if (diffDays <= 7) bands.overdue1to7.push(issue);
      else if (diffDays <= 30) bands.overdue8to30.push(issue);
      else bands.overdue30plus.push(issue);
    });

    return bands;
  }

  // ---- LOST / DAMAGED ----
  async markCopyLost(copyId: string, notes?: string) {
    const copy = await BookCopy.findOne({ _id: copyId, tenantId: this.tid });
    if (!copy) throw new NotFoundError('Book copy not found.');
    copy.status = 'LOST';
    await copy.save();

    // Also update any active issue to LOST
    await BookIssue.updateMany(
      { tenantId: this.tid, copyId: copy._id, status: { $in: ['ACTIVE', 'RENEWED', 'OVERDUE'] } },
      { $set: { status: 'LOST' } }
    );
    return copy;
  }

  async markCopyDamaged(copyId: string, notes?: string) {
    const copy = await BookCopy.findOne({ _id: copyId, tenantId: this.tid });
    if (!copy) throw new NotFoundError('Book copy not found.');
    copy.status = 'DAMAGED';
    await copy.save();
    return copy;
  }

  async markCopyUnderRepair(copyId: string) {
    const copy = await BookCopy.findOne({ _id: copyId, tenantId: this.tid });
    if (!copy) throw new NotFoundError('Book copy not found.');
    if (copy.status !== 'DAMAGED') throw new ValidationError('Only DAMAGED copies can be sent for repair.');
    copy.status = 'UNDER_REPAIR';
    await copy.save();
    return copy;
  }

  async markCopyRepaired(copyId: string) {
    const copy = await BookCopy.findOne({ _id: copyId, tenantId: this.tid });
    if (!copy) throw new NotFoundError('Book copy not found.');
    copy.status = 'AVAILABLE';
    copy.condition = 'FAIR';
    await copy.save();
    return copy;
  }

  async markCopyFound(copyId: string, condition: 'GOOD' | 'FAIR' | 'DAMAGED') {
    const copy = await BookCopy.findOne({ _id: copyId, tenantId: this.tid });
    if (!copy) throw new NotFoundError('Book copy not found.');
    if (copy.status !== 'LOST') throw new ValidationError('Copy is not marked as LOST.');
    copy.status = condition === 'DAMAGED' ? 'DAMAGED' : 'AVAILABLE';
    copy.condition = condition;
    await copy.save();
    return copy;
  }

  // ─── LOCATION MANAGEMENT ─────────────────────────────────────
  async getSections(libraryId?: string) {
    const { LibrarySection } = await import('../models/LibraryLocation.model');
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (libraryId) filter.libraryId = new mongoose.Types.ObjectId(libraryId);
    return LibrarySection.find(filter).sort({ name: 1 });
  }
  async createSection(data: any) {
    const { LibrarySection } = await import('../models/LibraryLocation.model');
    const libraryId = data.libraryId || '60d5ec49f1b2c80015f8a002';
    return LibrarySection.create({ ...data, libraryId, tenantId: this.tid });
  }
  async getRacks(sectionId?: string) {
    const { LibraryRack } = await import('../models/LibraryLocation.model');
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (sectionId) filter.sectionId = new mongoose.Types.ObjectId(sectionId);
    return LibraryRack.find(filter).sort({ rackNumber: 1 });
  }
  async createRack(data: any) {
    const { LibraryRack } = await import('../models/LibraryLocation.model');
    const libraryId = data.libraryId || '60d5ec49f1b2c80015f8a002';
    return LibraryRack.create({ ...data, libraryId, tenantId: this.tid });
  }
  async getShelves(rackId?: string) {
    const { LibraryShelf } = await import('../models/LibraryLocation.model');
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (rackId) filter.rackId = new mongoose.Types.ObjectId(rackId);
    return LibraryShelf.find(filter).sort({ shelfNumber: 1 });
  }
  async createShelf(data: any) {
    const { LibraryShelf } = await import('../models/LibraryLocation.model');
    const libraryId = data.libraryId || '60d5ec49f1b2c80015f8a002';
    return LibraryShelf.create({ ...data, libraryId, tenantId: this.tid });
  }

  // ─── LIBRARY ATTENDANCE ──────────────────────────────────────
  async getLibraryAttendance(query: any = {}) {
    const { LibraryVisit } = await import('../models/LibraryAttendance.model');
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query.libraryId) filter.libraryId = new mongoose.Types.ObjectId(query.libraryId as string);
    if (query.userId) filter.userId = new mongoose.Types.ObjectId(query.userId as string);
    return LibraryVisit.find(filter)
      .populate('userId', 'firstName lastName')
      .sort({ entryTime: -1 })
      .limit(200);
  }
  async recordLibraryEntry(data: any) {
    const { LibraryVisit } = await import('../models/LibraryAttendance.model');
    const libraryId = data.libraryId || '60d5ec49f1b2c80015f8a002';
    const purpose = data.purpose || 'STUDY';
    const memberType = data.memberType || 'STUDENT';
    const entryMethod = data.entryMethod || 'MANUAL';
    return LibraryVisit.create({ 
      ...data, 
      libraryId, 
      purpose, 
      memberType, 
      entryMethod, 
      tenantId: this.tid, 
      entryTime: data.entryTime || new Date() 
    });
  }
  async recordLibraryExit(visitId: string) {
    const { LibraryVisit } = await import('../models/LibraryAttendance.model');
    const visit = await LibraryVisit.findOne({ _id: visitId, tenantId: this.tid });
    if (!visit) throw new NotFoundError('Library visit not found');
    visit.exitTime = new Date();
    visit.durationMinutes = Math.ceil((visit.exitTime.getTime() - new Date(visit.entryTime).getTime()) / 60000);
    await visit.save();
    return visit;
  }
  async getLibraryOccupancy(libraryId?: string) {
    const { LibraryVisit } = await import('../models/LibraryAttendance.model');
    const filter: any = { tenantId: this.tid, exitTime: { $exists: false } };
    if (libraryId) filter.libraryId = new mongoose.Types.ObjectId(libraryId);
    const currentCount = await LibraryVisit.countDocuments(filter);
    return { currentOccupancy: currentCount };
  }

  // ─── READING PROGRAMS ────────────────────────────────────────
  async getReadingPrograms(query: any = {}) {
    const { ReadingProgram } = await import('../models/ReadingProgram.model');
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query.status) filter.status = query.status;
    return ReadingProgram.find(filter).sort({ startDate: -1 });
  }
  async createReadingProgram(data: any) {
    const { ReadingProgram } = await import('../models/ReadingProgram.model');
    if (!data.libraryId) data.libraryId = '60d5ec49f1b2c80015f8a002';
    return ReadingProgram.create({ ...data, tenantId: this.tid });
  }
  async updateReadingProgram(programId: string, data: any) {
    const { ReadingProgram } = await import('../models/ReadingProgram.model');
    const program = await ReadingProgram.findOneAndUpdate(
      { _id: programId, tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!program) throw new NotFoundError('Reading program not found');
    return program;
  }
  async enrollInReadingProgram(programId: string, userId: string) {
    const { ReadingProgramEnrollment } = await import('../models/ReadingProgram.model');
    const existing = await ReadingProgramEnrollment.findOne({
      tenantId: this.tid, programId: new mongoose.Types.ObjectId(programId),
      userId: new mongoose.Types.ObjectId(userId), isDeleted: { $ne: true }
    });
    if (existing) throw new ValidationError('Already enrolled in this program');
    return ReadingProgramEnrollment.create({
      tenantId: this.tid,
      programId: new mongoose.Types.ObjectId(programId),
      userId: new mongoose.Types.ObjectId(userId),
      enrolledAt: new Date(),
    });
  }

  // ─── READING LOG ─────────────────────────────────────────────
  async getReadingLog(userId: string, query: any = {}) {
    const { ReadingLog } = await import('../models/ReadingProgram.model');
    const filter: any = { tenantId: this.tid, userId: new mongoose.Types.ObjectId(userId), isDeleted: { $ne: true } };
    if (query.programId) filter.programId = new mongoose.Types.ObjectId(query.programId as string);
    return ReadingLog.find(filter).sort({ createdAt: -1 });
  }
  async addReadingLogEntry(data: any) {
    const { ReadingLog } = await import('../models/ReadingProgram.model');
    const libraryId = data.libraryId || '60d5ec49f1b2c80015f8a002';
    const startDate = data.startDate || new Date();
    return ReadingLog.create({ ...data, libraryId, startDate, tenantId: this.tid });
  }
  async updateReadingLogEntry(logId: string, data: any, userId: string) {
    const { ReadingLog } = await import('../models/ReadingProgram.model');
    const log = await ReadingLog.findOne({ _id: logId, tenantId: this.tid, userId: new mongoose.Types.ObjectId(userId) });
    if (!log) throw new NotFoundError('Reading log entry not found');
    Object.assign(log, data);
    await log.save();
    return log;
  }

  // ─── REPORTS ─────────────────────────────────────────────────
  async getReportsOverview(query: any = {}) {
    const [totalBooks, totalCopies, totalMembers, totalFines] = await Promise.all([
      (await import('../models/BookCatalogue.model')).BookCatalogue.countDocuments({ tenantId: this.tid, isDeleted: { $ne: true } }),
      (await import('../models/BookCopy.model')).default.countDocuments({ tenantId: this.tid, isDeleted: { $ne: true } }),
      (await import('../models/LibraryMembership.model')).default.countDocuments({ tenantId: this.tid, status: 'ACTIVE', isDeleted: { $ne: true } }),
      (await import('../models/LibraryFine.model')).default.countDocuments({ tenantId: this.tid, status: 'PENDING', isDeleted: { $ne: true } }),
    ]);
    return { totalBooks, totalCopies, totalMembers, pendingFines: totalFines };
  }
  async getIssuedBooksReport(query: any = {}) {
    const { BookIssue } = await import('../models/Circulation.model');
    return BookIssue.find({ tenantId: this.tid, isDeleted: { $ne: true } })
      .populate('userId', 'firstName lastName')
      .populate('bookId', 'title')
      .sort({ issueDate: -1 }).limit(500);
  }
  async getOverdueReport(query: any = {}) {
    const { BookIssue } = await import('../models/Circulation.model');
    return BookIssue.find({ tenantId: this.tid, status: { $in: ['ACTIVE', 'RENEWED', 'OVERDUE'] }, dueDate: { $lt: new Date() }, isDeleted: { $ne: true } })
      .populate('userId', 'firstName lastName')
      .populate('bookId', 'title')
      .sort({ dueDate: 1 });
  }
  async getFinesReport(query: any = {}) {
    const LibraryFine = (await import('../models/LibraryFine.model')).default;
    return LibraryFine.find({ tenantId: this.tid, isDeleted: { $ne: true } })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 }).limit(500);
  }
  async getAcquisitionReport(query: any = {}) {
    const LibraryAcquisition = (await import('../models/LibraryAcquisition.model')).default;
    return LibraryAcquisition.find({ tenantId: this.tid, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 }).limit(200);
  }

  // ─── SETTINGS ────────────────────────────────────────────────
  async getLibrarySettings() {
    const LibraryPolicy = (await import('../models/LibraryPolicy.model')).default;
    return LibraryPolicy.find({ tenantId: this.tid });
  }
  async updateLibrarySettings(data: any) {
    const LibraryPolicy = (await import('../models/LibraryPolicy.model')).default;
    return LibraryPolicy.findOneAndUpdate(
      { tenantId: this.tid },
      { $set: data },
      { new: true, upsert: true }
    );
  }
}

