import mongoose from 'mongoose';
import { Author, Publisher, Category, Subject, BookCatalogue } from '../models/BookCatalogue.model';
import Library from '../models/Library.model';
import BookCopy from '../models/BookCopy.model';
import { LibrarySection } from '../models/LibraryLocation.model';
import { NotFoundError } from '../../../core/errors/AppError';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

export class LibraryCatalogueService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  // ─── BOOKS ──────────────────────────────────────────────────
  async getBooks(filterOptions?: { categoryId?: string; search?: string; sectionId?: string } | string) {
    let categoryId: string | undefined;
    let search: string | undefined;
    let sectionId: string | undefined;

    if (typeof filterOptions === 'string') {
      categoryId = filterOptions;
    } else if (filterOptions) {
      categoryId = filterOptions.categoryId;
      search = filterOptions.search;
      sectionId = filterOptions.sectionId;
    }

    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.categoryIds = new mongoose.Types.ObjectId(categoryId);
    }
    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: sRegex },
        { isbn10: sRegex },
        { isbn13: sRegex },
        { isbn: sRegex },
        { edition: sRegex }
      ];
    }

    const books = await BookCatalogue.find(filter)
      .populate('authorIds', 'name')
      .populate('publisherId', 'name')
      .populate('categoryIds', 'name')
      .populate('subjectIds', 'name')
      .sort({ title: 1 })
      .lean();

    const bookIds = books.map((b: any) => b._id);
    const copyQuery: any = {
      tenantId: this.tid,
      bookId: { $in: bookIds },
      isDeleted: { $ne: true }
    };
    if (sectionId && mongoose.Types.ObjectId.isValid(sectionId)) {
      copyQuery.sectionId = new mongoose.Types.ObjectId(sectionId);
    }

    const copies = await BookCopy.find(copyQuery).populate('sectionId', 'name').lean();

    const copyMap = new Map<string, { total: number; available: number; reserved: number; issued: number; sections: Set<string> }>();
    copies.forEach((c: any) => {
      const bId = c.bookId.toString();
      if (!copyMap.has(bId)) {
        copyMap.set(bId, { total: 0, available: 0, reserved: 0, issued: 0, sections: new Set<string>() });
      }
      const stats = copyMap.get(bId)!;
      stats.total += 1;
      if (c.status === 'AVAILABLE') stats.available += 1;
      if (c.status === 'RESERVED') stats.reserved += 1;
      if (c.status === 'ISSUED') stats.issued += 1;
      if (c.sectionId && (c.sectionId as any).name) {
        stats.sections.add((c.sectionId as any).name);
      }
    });

    return books.map((b: any) => {
      const stats = copyMap.get(b._id.toString()) || { total: 0, available: 0, reserved: 0, issued: 0, sections: new Set<string>() };
      const sectionsArr = Array.from(stats.sections);
      return {
        ...b,
        totalCopies: stats.total,
        availableCopies: stats.available,
        reservedCopies: stats.reserved,
        issuedCopies: stats.issued,
        sectionNames: sectionsArr,
        primarySection: sectionsArr[0] || 'General Stack / Main Library',
        isOutOfStock: stats.available === 0
      };
    });
  }

  async getBookById(bookId: string) {
    const book = await BookCatalogue.findOne({ _id: bookId, tenantId: this.tid })
      .populate('authorIds', 'name biography')
      .populate('publisherId', 'name email website')
      .populate('categoryIds', 'name')
      .populate('subjectIds', 'name')
      .lean();
    if (!book) throw new NotFoundError('Book not found');

    const copies = await BookCopy.find({
      tenantId: this.tid,
      bookId: book._id,
      isDeleted: { $ne: true }
    }).populate('sectionId', 'name').lean();

    const total = copies.length;
    const available = copies.filter((c: any) => c.status === 'AVAILABLE').length;
    const reserved = copies.filter((c: any) => c.status === 'RESERVED').length;
    const issued = copies.filter((c: any) => c.status === 'ISSUED').length;
    const sections = Array.from(new Set(copies.map((c: any) => (c.sectionId as any)?.name).filter(Boolean)));

    return {
      ...book,
      totalCopies: total,
      availableCopies: available,
      reservedCopies: reserved,
      issuedCopies: issued,
      sectionNames: sections,
      primarySection: sections[0] || 'General Stack / Main Library',
      isOutOfStock: available === 0
    };
  }

  async createBook(data: any) {
    if (!data.language) data.language = 'English';
    if (!data.publisherId || String(data.publisherId).trim() === '') delete data.publisherId;
    if (!data.authorIds) data.authorIds = [];
    if (!data.categoryIds) data.categoryIds = [];
    if (!data.subjectIds) data.subjectIds = [];
    delete data.isbn10;
    delete data.isbn13;
    if (data.isbn && String(data.isbn).trim().length > 0) {
      const clean = String(data.isbn).replace(/[^0-9X]/gi, '').trim();
      if (clean.length === 10) data.isbn10 = clean;
      else if (clean.length > 0) data.isbn13 = clean;
    }
    return BookCatalogue.create({ ...data, tenantId: this.tid });
  }

  async updateBook(bookId: string, data: any) {
    const book = await BookCatalogue.findOneAndUpdate(
      { _id: bookId, tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!book) throw new NotFoundError('Book not found');
    return book;
  }

  // ─── AUTHORS ────────────────────────────────────────────────
  async getAuthors(query: any = {}) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query.status) filter.status = query.status;
    return Author.find(filter).sort({ name: 1 });
  }

  async createAuthor(data: any) {
    return Author.create({ ...data, tenantId: this.tid });
  }

  async updateAuthor(authorId: string, data: any) {
    const author = await Author.findOneAndUpdate(
      { _id: authorId, tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!author) throw new NotFoundError('Author not found');
    return author;
  }

  // ─── PUBLISHERS ─────────────────────────────────────────────
  async getPublishers(query: any = {}) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query.status) filter.status = query.status;
    return Publisher.find(filter).sort({ name: 1 });
  }

  async createPublisher(data: any) {
    return Publisher.create({ ...data, tenantId: this.tid });
  }

  async updatePublisher(publisherId: string, data: any) {
    const publisher = await Publisher.findOneAndUpdate(
      { _id: publisherId, tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!publisher) throw new NotFoundError('Publisher not found');
    return publisher;
  }

  // ─── CATEGORIES ─────────────────────────────────────────────
  async getCategories(query: any = {}) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query.status) filter.status = query.status;
    return Category.find(filter).sort({ name: 1 });
  }

  async createCategory(data: any) {
    return Category.create({ ...data, tenantId: this.tid });
  }

  async updateCategory(categoryId: string, data: any) {
    const cat = await Category.findOneAndUpdate(
      { _id: categoryId, tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!cat) throw new NotFoundError('Category not found');
    return cat;
  }

  // ─── SUBJECTS ───────────────────────────────────────────────
  async getSubjects(query: any = {}) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query.status) filter.status = query.status;
    return Subject.find(filter).sort({ name: 1 });
  }

  async createSubject(data: any) {
    return Subject.create({ ...data, tenantId: this.tid });
  }

  async updateSubject(subjectId: string, data: any) {
    const sub = await Subject.findOneAndUpdate(
      { _id: subjectId, tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!sub) throw new NotFoundError('Subject not found');
    return sub;
  }

  // ─── BOOK COPIES ─────────────────────────────────────────────
  async getBookCopies(bookId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (bookId) filter.bookId = new mongoose.Types.ObjectId(bookId);
    return BookCopy.find(filter)
      .populate('bookId', 'title isbn13')
      .populate('sectionId', 'name');
  }

  async getBookCopyById(copyId: string) {
    const copy = await BookCopy.findOne({ _id: copyId, tenantId: this.tid })
      .populate('bookId', 'title isbn13 authorIds')
      .populate('sectionId', 'name');
    if (!copy) throw new NotFoundError('Book copy not found');
    return copy;
  }

  async createBookCopy(data: any) {
    let qrCode = '';
    const identifier = data.accessionNumber || data.copyId;
    if (identifier) {
      try {
        qrCode = await QRCode.toDataURL(identifier);
        const buffer = await bwipjs.toBuffer({
          bcid: 'code128',
          text: identifier,
          height: 10,
          includetext: true,
          textxalign: 'center',
        });
        // barcodeUri stored inline if needed
        void buffer;
      } catch (e) {
        console.error('Failed to generate barcode/QR', e);
      }
    }
    
    // Ensure Library ID and Acquisition Source exist
    let libraryId = data.libraryId;
    if (!libraryId) {
      let defaultLib = await Library.findOne({ tenantId: this.tid, status: 'ACTIVE' });
      if (!defaultLib) {
        // Fallback: create a main library if absolutely none exist
        defaultLib = await Library.create({
          tenantId: this.tid,
          branchId: this.tid, // Using tenantId as branch fallback for demo
          code: 'MAIN-LIB',
          name: 'Main Library',
          type: 'MAIN',
          status: 'ACTIVE'
        });
      }
      libraryId = defaultLib._id;
    }

    const newCopy = await BookCopy.create({
      ...data,
      libraryId,
      acquisitionSource: data.acquisitionSource || 'PURCHASE',
      tenantId: this.tid,
      qrCode,
      barcode: data.barcode || identifier,
    });

    if (newCopy.status === 'AVAILABLE') {
      try {
        const { CirculationService } = await import('./circulation.service');
        const { LibrarySection } = await import('../models/LibraryLocation.model');
        let secName = 'General Stack';
        if (newCopy.sectionId) {
          const sec = await LibrarySection.findById(newCopy.sectionId).lean();
          if (sec) secName = sec.name;
        }
        new CirculationService(this.tenantId).notifyStockRefill(newCopy.bookId, secName).catch(() => {});
      } catch (e) {}
    }

    return newCopy;
  }

  async updateBookCopy(copyId: string, data: any) {
    const copy = await BookCopy.findOneAndUpdate(
      { _id: copyId, tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!copy) throw new NotFoundError('Book copy not found');
    if (copy.status === 'AVAILABLE') {
      try {
        const { CirculationService } = await import('./circulation.service');
        new CirculationService(this.tenantId).notifyStockRefill(copy.bookId).catch(() => {});
      } catch (e) {}
    }
    return copy;
  }

  // ─── LOCATIONS ───────────────────────────────────────────────
  async getLocations(libraryId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (libraryId) filter.libraryId = new mongoose.Types.ObjectId(libraryId);
    return LibrarySection.find(filter);
  }
}
