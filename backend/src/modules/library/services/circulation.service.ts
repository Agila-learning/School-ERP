import mongoose from 'mongoose';
import { BookIssue, BookReturn, BookReservation } from '../models/Circulation.model';
import BookCopy from '../models/BookCopy.model';
import Library from '../models/Library.model';
import LibraryMembership from '../models/LibraryMembership.model';
import { NotFoundError, ValidationError } from '../../../core/errors/AppError';

export class CirculationService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getActiveIssues(userId?: string, copyBarcode?: string) {
    const filter: any = { tenantId: this.tid, status: { $in: ['ACTIVE', 'RENEWED', 'OVERDUE'] }, isDeleted: { $ne: true } };
    if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
    
    let query = BookIssue.find(filter)
      .populate('bookId', 'title authors')
      .populate('copyId', 'accessionNumber barcode')
      .populate('userId', 'firstName lastName admissionNumber');
      
    const issues = await query.exec();
    
    if (copyBarcode) {
      return issues.filter((i: any) => i.copyId && i.copyId.barcode === copyBarcode);
    }
    return issues;
  }

  async issueBook(data: any) {
    // Requires: userId, copyId, libraryId, issuedByUserId
    let session: mongoose.ClientSession | null = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      session = null;
    }

    try {
      // 1. Verify / Auto-provision Membership
      const userObjId = new mongoose.Types.ObjectId(data.userId);
      let membership = await LibraryMembership.findOne({
        tenantId: this.tid,
        userId: userObjId,
        status: 'ACTIVE'
      });
      if (!membership) {
        const AcademicYear = (await import('../../academic/models/AcademicYear.model')).default;
        const currentYear = await AcademicYear.findOne({ tenantId: this.tid, status: { $in: ['active', 'ACTIVE'] } }) || await AcademicYear.findOne({ tenantId: this.tid });
        const academicYearId = currentYear?._id || new mongoose.Types.ObjectId();

        membership = await LibraryMembership.create({
          tenantId: this.tid,
          userId: userObjId,
          academicYearId,
          membershipNumber: `MEM-${Date.now().toString().slice(-6)}`,
          memberType: 'STUDENT',
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

      // 1b. Get default library if not provided
      let libraryId = data.libraryId;
      if (!libraryId) {
        let defaultLib = await Library.findOne({ tenantId: this.tid, status: 'ACTIVE' });
        if (!defaultLib) {
          defaultLib = await Library.create({
            tenantId: this.tid,
            name: 'Central Campus Library',
            code: 'LIB001',
            status: 'ACTIVE'
          });
        }
        libraryId = defaultLib._id;
      }

      // 2. Verify Copy Availability
      const copy = await BookCopy.findOne({
        _id: data.copyId,
        tenantId: this.tid,
        status: 'AVAILABLE'
      });
      if (!copy) throw new ValidationError('Book copy is not available for issue.');

      // 2a. Check Borrowing Limits
      const activeIssuesCount = await BookIssue.countDocuments({
        tenantId: this.tid,
        userId: membership.userId,
        status: { $in: ['ACTIVE', 'RENEWED', 'OVERDUE'] },
        isDeleted: { $ne: true }
      });
      
      if (activeIssuesCount >= (membership.maxBooksAllowed || 5)) {
        throw new ValidationError(`Borrow limit reached. Maximum ${membership.maxBooksAllowed || 5} books allowed.`);
      }

      // 3. Issue Book
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (membership.issueDurationDays || 14));

      const issue = await BookIssue.create([{
        tenantId: this.tid,
        libraryId: libraryId,
        membershipId: membership._id,
        userId: membership.userId,
        bookId: copy.bookId,
        copyId: copy._id,
        issueDate: new Date(),
        dueDate,
        issuedByUserId: data.issuedByUserId,
        status: 'ACTIVE'
      }], session ? { session } : undefined);

      // 4. Update Copy Status
      copy.status = 'ISSUED';
      if (session) {
        await copy.save({ session });
        await session.commitTransaction();
      } else {
        await copy.save();
      }
      return issue[0];
    } catch (err) {
      if (session) await session.abortTransaction();
      throw err;
    } finally {
      if (session) session.endSession();
    }
  }

  async returnBook(issueId: string, data: any) {
    let session: mongoose.ClientSession | null = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      session = null;
    }

    try {
      const issue = await BookIssue.findOne({
        _id: issueId,
        tenantId: this.tid,
        status: { $in: ['ACTIVE', 'RENEWED', 'OVERDUE'] }
      });
      if (!issue) throw new NotFoundError('Active issue record not found.');

      const copy = await BookCopy.findOne({ _id: issue.copyId });
      if (!copy) throw new NotFoundError('Book copy not found.');

      // 1. Check Overdue & Calculate Fine
      let fineId;
      const today = new Date();
      if (today > issue.dueDate) {
         const diffTime = today.getTime() - issue.dueDate.getTime();
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         const membership = await LibraryMembership.findOne({ _id: issue.membershipId });
         
         const graceDays = membership?.gracePeriodDays ?? 2;
         const fineRate = membership?.finePerDay ?? 5;
         if (diffDays > graceDays) {
            const fineAmount = (diffDays - graceDays) * fineRate;
            if (fineAmount > 0) {
               const LibraryFine = mongoose.models['LibraryFine'] || mongoose.model('LibraryFine');
               const fine = await LibraryFine.create([{
                 tenantId: this.tid,
                 academicYearId: membership?.academicYearId,
                 userId: issue.userId,
                 issueId: issue._id,
                 copyId: copy._id,
                 fineType: 'OVERDUE',
                 description: `Overdue by ${diffDays} days.`,
                 amount: fineAmount,
                 netAmount: fineAmount,
                 status: 'PENDING'
               }], session ? { session } : undefined);
               fineId = fine[0]._id;
            }
         }
      }

      // 2. Record Return
      const returnRec = await BookReturn.create([{
        tenantId: this.tid,
        issueId: issue._id,
        copyId: copy._id,
        userId: issue.userId,
        returnDate: new Date(),
        receivedByUserId: data.receivedByUserId,
        condition: data.condition || 'GOOD',
        remarks: data.remarks,
        fineId: fineId
      }], session ? { session } : undefined);

      // 3. Update Issue Status
      issue.status = 'RETURNED';
      if (session) {
        await issue.save({ session });
      } else {
        await issue.save();
      }

      // 4. Update Copy Status
      if (['DAMAGED', 'POOR', 'LOST'].includes(data.condition)) {
        copy.status = data.condition === 'LOST' ? 'LOST' : 'DAMAGED';
      } else {
        copy.status = 'AVAILABLE';
      }
      
      if (session) {
        await copy.save({ session });
        await session.commitTransaction();
      } else {
        await copy.save();
      }

      if (copy.status === 'AVAILABLE') {
        try {
          const { LibrarySection } = await import('../models/LibraryLocation.model');
          let secName = 'General Stack';
          if (copy.sectionId) {
            const sec = await LibrarySection.findById(copy.sectionId).lean();
            if (sec) secName = sec.name;
          }
          this.notifyStockRefill(copy.bookId, secName).catch(() => {});
        } catch (e) {}
      }

      return returnRec[0];
    } catch (err) {
      if (session) await session.abortTransaction();
      throw err;
    } finally {
      if (session) session.endSession();
    }
  }

  async renewBook(issueId: string, data: any) {
    let session: mongoose.ClientSession | null = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      session = null;
    }

    try {
      const issue = await BookIssue.findOne({
        _id: issueId,
        tenantId: this.tid,
        status: { $in: ['ACTIVE', 'OVERDUE'] }
      });
      
      if (!issue) throw new NotFoundError('Active issue record not found.');

      const membership = await LibraryMembership.findOne({ _id: issue.membershipId });
      const maxRenewals = membership?.maxRenewalsAllowed ?? 2;
      const durationDays = membership?.issueDurationDays ?? 14;

      if ((issue.renewalCount || 0) >= maxRenewals) {
        throw new ValidationError('Maximum renewal limit reached.');
      }

      // Check for reservations
      const existingReservations = await BookReservation.countDocuments({
        tenantId: this.tid,
        bookId: issue.bookId,
        status: 'ACTIVE'
      });

      if (existingReservations > 0) {
        throw new ValidationError('Cannot renew book because it is reserved by another member.');
      }

      const newDueDate = new Date(issue.dueDate);
      newDueDate.setDate(newDueDate.getDate() + durationDays);

      issue.renewals.push({
        renewedDate: new Date(),
        newDueDate: newDueDate,
        renewedByUserId: data.renewedByUserId
      });
      issue.dueDate = newDueDate;
      issue.renewalCount = (issue.renewalCount || 0) + 1;
      issue.status = 'RENEWED';

      if (session) {
        await issue.save({ session });
        await session.commitTransaction();
      } else {
        await issue.save();
      }
      return issue;
    } catch (err) {
      if (session) await session.abortTransaction();
      throw err;
    } finally {
      if (session) session.endSession();
    }
  }

  async reserveBook(data: any) {
    let session: mongoose.ClientSession | null = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      session = null;
    }

    try {
      const userObjId = new mongoose.Types.ObjectId(data.userId);
      let membership = await LibraryMembership.findOne({
        tenantId: this.tid,
        userId: userObjId,
        status: 'ACTIVE'
      });
      
      if (!membership) {
        const AcademicYear = (await import('../../academic/models/AcademicYear.model')).default;
        const currentYear = await AcademicYear.findOne({ tenantId: this.tid, status: { $in: ['active', 'ACTIVE'] } }) || await AcademicYear.findOne({ tenantId: this.tid });
        const academicYearId = currentYear?._id || new mongoose.Types.ObjectId();

        membership = await LibraryMembership.create({
          tenantId: this.tid,
          userId: userObjId,
          academicYearId,
          membershipNumber: `MEM-${Date.now().toString().slice(-6)}`,
          memberType: 'STUDENT',
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

      // Check if user already has an active reservation for this book
      const existingRes = await BookReservation.findOne({
        tenantId: this.tid,
        userId: membership.userId,
        bookId: new mongoose.Types.ObjectId(data.bookId),
        status: 'ACTIVE'
      });
      if (existingRes) {
        throw new ValidationError('You have already placed an active reservation for this book.');
      }

      // Check if user already has the book issued
      const activeIssue = await BookIssue.findOne({
        tenantId: this.tid,
        userId: membership.userId,
        bookId: new mongoose.Types.ObjectId(data.bookId),
        status: { $in: ['ACTIVE', 'RENEWED', 'OVERDUE'] }
      });
      
      if (activeIssue) {
        throw new ValidationError('You currently have a copy of this book issued.');
      }

      // Find an AVAILABLE copy of this book to reserve
      const availableCopy = await BookCopy.findOne({
        tenantId: this.tid,
        bookId: new mongoose.Types.ObjectId(data.bookId),
        status: 'AVAILABLE',
        isDeleted: { $ne: true }
      });

      if (availableCopy) {
        availableCopy.status = 'RESERVED';
        await availableCopy.save();
      }

      // Count remaining available copies for this book
      const remainingAvailable = await BookCopy.countDocuments({
        tenantId: this.tid,
        bookId: new mongoose.Types.ObjectId(data.bookId),
        status: 'AVAILABLE',
        isDeleted: { $ne: true }
      });

      const queuePosition = await BookReservation.countDocuments({
        tenantId: this.tid,
        bookId: new mongoose.Types.ObjectId(data.bookId),
        status: 'ACTIVE'
      }) + 1;

      const reservation = await BookReservation.create({
        tenantId: this.tid,
        libraryId: data.libraryId || new mongoose.Types.ObjectId(),
        membershipId: membership._id,
        userId: membership.userId,
        bookId: new mongoose.Types.ObjectId(data.bookId),
        requestedDate: new Date(),
        queuePosition,
        status: 'ACTIVE'
      });

      // Fetch Book details for stock alert
      const { BookCatalogue } = await import('../models/BookCatalogue.model');
      const bookDoc = await BookCatalogue.findById(data.bookId).lean();
      const bookTitle = bookDoc?.title || 'Library Book';

      // Send Out-of-Stock and Member Notifications
      try {
        const Notification = (await import('../../communication/models/Notification.model')).default;
        const User = (await import('../../auth/models/User.model')).default;

        // If out of stock, alert librarian & administration
        if (remainingAvailable === 0) {
          const staffRecipients = await User.find({
            tenantId: this.tid,
            $or: [
              { roles: { $elemMatch: { name: /LIBRARIAN|ADMIN|OFFICE/i } } },
              { role: { $in: ['LIBRARIAN', 'HEAD_LIBRARIAN', 'ADMIN', 'OFFICE_ADMIN'] } }
            ]
          }, '_id').lean();

          for (const recipient of staffRecipients) {
            await Notification.create({
              tenantId: this.tid,
              recipientId: recipient._id,
              title: `⚠️ Library Stock Alert: "${bookTitle}" Out of Stock`,
              message: `All physical copies of "${bookTitle}" (ISBN: ${bookDoc?.isbn13 || bookDoc?.isbn10 || 'N/A'}) are now fully reserved or checked out. Available stock: 0. Refill or procurement required.`,
              type: 'SYSTEM',
              link: '/library/catalogue',
              readStatus: false
            }).catch(() => {});
          }
        }

        // Notify reserving member
        if (membership.userId) {
          await Notification.create({
            tenantId: this.tid,
            recipientId: membership.userId,
            title: `📚 Book Reserved: "${bookTitle}"`,
            message: remainingAvailable === 0
              ? `Your reservation for "${bookTitle}" is confirmed (Queue Position #${queuePosition}). Note: Shelf stock is currently fully reserved. You will be notified immediately when stock is refilled.`
              : `Your reservation for "${bookTitle}" is confirmed (Queue Position #${queuePosition}). A copy has been held for you at the library counter.`,
            type: 'GENERAL',
            link: '/student-portal/library',
            readStatus: false
          }).catch(() => {});
        }
      } catch (notifErr) {
        console.warn('Library reservation notification notice:', notifErr);
      }

      if (session) await session.commitTransaction();
      return {
        ...reservation.toObject(),
        remainingAvailable,
        isOutOfStock: remainingAvailable === 0,
        bookTitle
      };
    } catch (err) {
      if (session) await session.abortTransaction();
      throw err;
    } finally {
      if (session) session.endSession();
    }
  }

  async getReservations(query: any = {}) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query.status) filter.status = query.status;
    if (query.userId) filter.userId = new mongoose.Types.ObjectId(query.userId as string);
    return BookReservation.find(filter)
      .populate('bookId', 'title isbn13 author category publisher status')
      .populate('userId', 'firstName lastName admissionNumber email')
      .sort({ requestedDate: -1 });
  }

  async cancelReservation(reservationId: string, cancelledBy: string) {
    const reservation = await BookReservation.findOne({ _id: reservationId, tenantId: this.tid });
    if (!reservation) throw new NotFoundError('Reservation not found');
    if (reservation.status !== 'ACTIVE') throw new ValidationError('Only active reservations can be cancelled');
    reservation.status = 'CANCELLED';
    await reservation.save();

    // Release a reserved copy back to AVAILABLE
    const copy = await BookCopy.findOne({
      tenantId: this.tid,
      bookId: reservation.bookId,
      status: 'RESERVED',
      isDeleted: { $ne: true }
    });
    if (copy) {
      copy.status = 'AVAILABLE';
      await copy.save();
      this.notifyStockRefill(reservation.bookId).catch(() => {});
    }

    return reservation;
  }

  async notifyStockRefill(bookId: mongoose.Types.ObjectId | string, sectionName?: string) {
    try {
      const { BookCatalogue } = await import('../models/BookCatalogue.model');
      const bookDoc = await BookCatalogue.findById(bookId).lean();
      if (!bookDoc) return;
      const bookTitle = bookDoc.title || 'Library Book';

      const Notification = (await import('../../communication/models/Notification.model')).default;

      // Find active reservations waiting for this book
      const pendingReservations = await BookReservation.find({
        tenantId: this.tid,
        bookId: new mongoose.Types.ObjectId(bookId),
        status: 'ACTIVE'
      }).sort({ queuePosition: 1, requestedDate: 1 }).lean();

      if (pendingReservations.length > 0) {
        // Notify the first waiting student/member
        const firstWaiting = pendingReservations[0];
        if (firstWaiting.userId) {
          await Notification.create({
            tenantId: this.tid,
            recipientId: firstWaiting.userId,
            title: `📗 Book Refilled: "${bookTitle}" Now Available!`,
            message: `Great news! "${bookTitle}" has been refilled in section "${sectionName || 'General Stack'}". You are #1 in queue. Please collect your reserved copy at the library circulation desk.`,
            type: 'GENERAL',
            link: '/student-portal/library',
            readStatus: false
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('notifyStockRefill warning:', e);
    }
  }
}

