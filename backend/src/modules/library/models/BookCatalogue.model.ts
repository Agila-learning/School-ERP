import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface IAuthor extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  biography?: string;
  country?: string;
  website?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IPublisher extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  contact?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ICategory extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string; // e.g., Technology
  parentId?: mongoose.Types.ObjectId; // Hierarchical
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ISubject extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IBookCatalogue extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  isbn10?: string;
  isbn13?: string;
  title: string;
  subtitle?: string;
  edition?: string;
  language: string;
  publicationYear?: number;
  publisherId?: mongoose.Types.ObjectId;
  authorIds: mongoose.Types.ObjectId[];
  categoryIds: mongoose.Types.ObjectId[];
  subjectIds: mongoose.Types.ObjectId[];
  description?: string;
  pages?: number;
  coverImageUrl?: string;
  keywords: string[];
  price?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

// Sub-schemas
const AuthorSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  biography: String,
  country: String,
  website: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });
AuthorSchema.plugin(softDeletePlugin);

const PublisherSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  contact: String,
  address: String,
  website: String,
  email: String,
  phone: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });
PublisherSchema.plugin(softDeletePlugin);

const CategorySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });
CategorySchema.plugin(softDeletePlugin);

const SubjectSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });
SubjectSchema.plugin(softDeletePlugin);

const BookCatalogueSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  isbn10: { type: String, index: true },
  isbn13: { type: String, index: true },
  title: { type: String, required: true, index: true },
  subtitle: String,
  edition: String,
  language: { type: String, required: true },
  publicationYear: Number,
  publisherId: { type: Schema.Types.ObjectId, ref: 'Publisher' },
  authorIds: [{ type: Schema.Types.ObjectId, ref: 'Author' }],
  categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  description: String,
  pages: Number,
  coverImageUrl: String,
  keywords: [String],
  price: Number,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });

// Ensure ISBNs are unique per tenant if provided
BookCatalogueSchema.index(
  { tenantId: 1, isbn13: 1 },
  { unique: true, partialFilterExpression: { isbn13: { $type: "string" } } }
);
BookCatalogueSchema.index(
  { tenantId: 1, isbn10: 1 },
  { unique: true, partialFilterExpression: { isbn10: { $type: "string" } } }
);
// Full-text search index
BookCatalogueSchema.index({ title: 'text', keywords: 'text' });
BookCatalogueSchema.plugin(softDeletePlugin);

export const Author = (mongoose.models['Author'] || mongoose.model<IAuthor>('Author', AuthorSchema)) as any;
export const Publisher = (mongoose.models['Publisher'] || mongoose.model<IPublisher>('Publisher', PublisherSchema)) as any;
export const Category = (mongoose.models['Category'] || mongoose.model<ICategory>('Category', CategorySchema)) as any;
export const Subject = (mongoose.models['Subject'] || mongoose.model<ISubject>('Subject', SubjectSchema)) as any;
export const BookCatalogue = (mongoose.models['BookCatalogue'] || mongoose.model<IBookCatalogue>('BookCatalogue', BookCatalogueSchema)) as any;
