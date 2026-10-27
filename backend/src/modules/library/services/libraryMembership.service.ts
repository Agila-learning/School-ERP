import mongoose from 'mongoose';
import LibraryMembership from '../models/LibraryMembership.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class LibraryMembershipService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getMembers(filters: { status?: string; memberType?: string; search?: string } = {}) {
    const query: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (filters.status) query.status = filters.status;
    if (filters.memberType) query.memberType = filters.memberType;

    let memberships = LibraryMembership.find(query)
      .populate('userId', 'firstName lastName email role photoUrl')
      .populate('libraryId', 'name')
      .sort({ createdAt: -1 });

    return memberships;
  }

  async getMemberById(membershipId: string) {
    const m = await LibraryMembership.findOne({ _id: membershipId, tenantId: this.tid })
      .populate('userId', 'firstName lastName email role photoUrl')
      .populate('libraryId', 'name');
    if (!m) throw new NotFoundError('Library membership not found.');
    return m;
  }

  async registerMember(data: {
    userId: string;
    libraryId?: string;
    memberType: string;
    academicYearId: string;
    maxBooksAllowed: number;
    issueDurationDays: number;
    renewalLimit: number;
    reservationLimit: number;
    finePerDay: number;
    gracePeriodDays: number;
    expiryDate?: Date;
  }) {
    // Check for existing active membership
    const existing = await LibraryMembership.findOne({
      tenantId: this.tid,
      userId: new mongoose.Types.ObjectId(data.userId),
      status: 'ACTIVE',
      isDeleted: { $ne: true }
    });
    if (existing) throw new ValidationError('Member already has an active library membership.');

    const membershipNumber = `LM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return LibraryMembership.create({
      tenantId: this.tid,
      userId: new mongoose.Types.ObjectId(data.userId),
      libraryId: data.libraryId ? new mongoose.Types.ObjectId(data.libraryId) : undefined,
      academicYearId: new mongoose.Types.ObjectId(data.academicYearId),
      membershipNumber,
      memberType: data.memberType,
      startDate: new Date(),
      expiryDate: data.expiryDate,
      status: 'ACTIVE',
      maxBooksAllowed: data.maxBooksAllowed,
      issueDurationDays: data.issueDurationDays,
      renewalLimit: data.renewalLimit,
      reservationLimit: data.reservationLimit,
      finePerDay: data.finePerDay,
      gracePeriodDays: data.gracePeriodDays,
    });
  }

  async updateMemberStatus(
    membershipId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'CANCELLED' | 'EXPIRED',
    reason?: string
  ) {
    const membership = await LibraryMembership.findOne({ _id: membershipId, tenantId: this.tid });
    if (!membership) throw new NotFoundError('Library membership not found.');

    membership.status = status;
    await membership.save();
    return membership;
  }

  async getMembershipStats() {
    const stats = await LibraryMembership.aggregate([
      { $match: { tenantId: this.tid, isDeleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const result: Record<string, number> = { ACTIVE: 0, SUSPENDED: 0, BLOCKED: 0, EXPIRED: 0 };
    stats.forEach((s: any) => result[s._id] = s.count);
    return result;
  }

  // ─── LIBRARY CARDS ───────────────────────────────────────────
  async getLibraryCards(query: any = {}) {
    const { LibraryCard } = await import('../models/LibraryCard.model');
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query.status) filter.status = query.status;
    if (query.userId) filter.userId = new mongoose.Types.ObjectId(query.userId as string);
    return LibraryCard.find(filter)
      .populate('userId', 'firstName lastName')
      .populate('membershipId')
      .sort({ createdAt: -1 });
  }

  async issueLibraryCard(data: any) {
    const { LibraryCard } = await import('../models/LibraryCard.model');
    const LibraryMembership = (await import('../models/LibraryMembership.model')).default;
    
    let membership: any = null;
    if (data.membershipId && mongoose.Types.ObjectId.isValid(data.membershipId)) {
      membership = await LibraryMembership.findOne({ _id: data.membershipId, tenantId: this.tid });
    }
    if (!membership && data.userId && mongoose.Types.ObjectId.isValid(data.userId)) {
      membership = await LibraryMembership.findOne({ userId: data.userId, tenantId: this.tid });
      if (!membership) {
        const AcademicYear = (await import('../../academic/models/AcademicYear.model')).default;
        const currentYear = await AcademicYear.findOne({ tenantId: this.tid, status: { $in: ['active', 'ACTIVE'] } }) || await AcademicYear.findOne({ tenantId: this.tid }).sort({ createdAt: -1 });
        const academicYearId = currentYear?._id || new mongoose.Types.ObjectId('60d5ec49f1b2c80015f8a002');
        const membershipNumber = `MEM-${Date.now().toString().slice(-6)}`;

        membership = await LibraryMembership.create({
          tenantId: this.tid,
          userId: new mongoose.Types.ObjectId(data.userId),
          academicYearId,
          membershipNumber,
          memberType: data.memberType || 'STUDENT',
          status: 'ACTIVE',
          maxBooksAllowed: 5,
          issueDurationDays: 14,
          renewalLimit: 2,
          reservationLimit: 2,
          finePerDay: 5,
          gracePeriodDays: 2,
          startDate: new Date()
        });
      }
    }

    const userId = data.userId || (membership?.userId) || this.tid;
    const membershipId = (membership?._id) || data.membershipId || new mongoose.Types.ObjectId('60d5ec49f1b2c80015f8a002');
    const libraryId = data.libraryId || (membership?.libraryId) || new mongoose.Types.ObjectId('60d5ec49f1b2c80015f8a002');
    const memberType = data.memberType || (membership?.memberType) || 'STUDENT';
    const validFrom = data.validFrom ? new Date(data.validFrom) : new Date();
    const validUntil = data.validUntil ? new Date(data.validUntil) : new Date(Date.now() + 365 * 86400000);
    const issuedBy = data.issuedBy && mongoose.Types.ObjectId.isValid(data.issuedBy) ? new mongoose.Types.ObjectId(data.issuedBy) : this.tid;
    const cardNumber = data.cardNumber || `LC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    return LibraryCard.create({
      ...data,
      tenantId: this.tid,
      libraryId,
      membershipId,
      userId,
      memberType,
      cardNumber,
      validFrom,
      validUntil,
      issuedBy,
      issuedDate: new Date(),
      status: 'ACTIVE'
    });
  }

  async blockLibraryCard(cardId: string, reason: string, blockedBy: string) {
    const { LibraryCard } = await import('../models/LibraryCard.model');
    const card = await LibraryCard.findOne({ _id: cardId, tenantId: this.tid });
    if (!card) throw new ValidationError('Library card not found');
    card.status = 'BLOCKED';
    card.blockedReason = reason;
    await card.save();
    return card;
  }

  async replaceLibraryCard(oldCardId: string, data: any, issuedBy: string) {
    const { LibraryCard } = await import('../models/LibraryCard.model');
    const oldCard = await LibraryCard.findOne({ _id: oldCardId, tenantId: this.tid });
    if (!oldCard) throw new ValidationError('Library card not found');
    // Mark old card as replaced
    oldCard.status = 'REPLACED';
    await oldCard.save();
    // Issue new card
    const cardNumber = `LC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const newCard = await LibraryCard.create({
      ...data,
      tenantId: this.tid,
      cardNumber,
      issuedBy: new mongoose.Types.ObjectId(issuedBy),
      issuedDate: new Date(),
      membershipId: oldCard.membershipId,
      userId: oldCard.userId,
      libraryId: oldCard.libraryId,
      memberType: oldCard.memberType,
    });
    oldCard.replacedByCardId = newCard._id;
    await oldCard.save();
    return newCard;
  }

  // ─── MEMBER HISTORY ─────────────────────────────────────────
  async getMemberHistory(membershipId: string) {
    const { BookIssue } = await import('../models/Circulation.model');
    const LibraryFine = (await import('../models/LibraryFine.model')).default;
    const [issues, fines] = await Promise.all([
      BookIssue.find({ tenantId: this.tid, membershipId: new mongoose.Types.ObjectId(membershipId), isDeleted: { $ne: true } })
        .populate('bookId', 'title isbn13')
        .populate('copyId', 'accessionNumber barcode')
        .sort({ issueDate: -1 }).limit(100),
      LibraryFine.find({ tenantId: this.tid, membershipId: new mongoose.Types.ObjectId(membershipId), isDeleted: { $ne: true } })
        .sort({ createdAt: -1 }).limit(50),
    ]);
    return { issues, fines };
  }
}

