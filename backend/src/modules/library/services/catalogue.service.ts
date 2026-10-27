import mongoose from 'mongoose';
import { BookCatalogue, Author, Publisher, Category, Subject } from '../models/BookCatalogue.model';
import BookCopy from '../models/BookCopy.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class CatalogueService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getBooks(query: string = '', categoryId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (query) {
      filter.$text = { $search: query };
    }
    if (categoryId) {
      filter.categoryIds = new mongoose.Types.ObjectId(categoryId);
    }
    return BookCatalogue.find(filter)
      .populate('authorIds', 'name')
      .populate('publisherId', 'name')
      .populate('categoryIds', 'name');
  }

  async createBook(data: any) {
    return BookCatalogue.create({ ...data, tenantId: this.tid });
  }

  async getBookCopies(bookId: string) {
    return BookCopy.find({
      tenantId: this.tid,
      bookId: new mongoose.Types.ObjectId(bookId),
      isDeleted: { $ne: true },
    }).populate('currentHolderId', 'firstName lastName').populate('libraryId', 'name');
  }

  async addCopy(bookId: string, data: any) {
    return BookCopy.create({
      ...data,
      bookId: new mongoose.Types.ObjectId(bookId),
      tenantId: this.tid,
    });
  }

  async getAuthors() {
    return Author.find({ tenantId: this.tid, isDeleted: { $ne: true } });
  }

  async createAuthor(data: any) {
    return Author.create({ ...data, tenantId: this.tid });
  }

  async getCategories() {
    return Category.find({ tenantId: this.tid, isDeleted: { $ne: true } });
  }

  async createCategory(data: any) {
    return Category.create({ ...data, tenantId: this.tid });
  }
}
