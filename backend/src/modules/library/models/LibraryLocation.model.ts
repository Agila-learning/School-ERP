import mongoose, { Document, Schema } from 'mongoose';
import { ISoftDeleted, softDeletePlugin } from '../../../core/plugins/softDelete.plugin';

export interface ILibrarySection extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ILibraryRack extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  rackNumber: string;
  name?: string;
  location?: string;
  capacity?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ILibraryShelf extends Document, ISoftDeleted {
  tenantId: mongoose.Types.ObjectId;
  libraryId: mongoose.Types.ObjectId;
  rackId: mongoose.Types.ObjectId;
  shelfNumber: string;
  label?: string;
  capacity?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const SectionSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });
SectionSchema.index({ tenantId: 1, libraryId: 1, code: 1 }, { unique: true });
SectionSchema.plugin(softDeletePlugin);

const RackSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'LibrarySection', required: true },
  rackNumber: { type: String, required: true },
  name: String,
  location: String,
  capacity: Number,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });
RackSchema.index({ tenantId: 1, libraryId: 1, sectionId: 1, rackNumber: 1 }, { unique: true });
RackSchema.plugin(softDeletePlugin);

const ShelfSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Library', required: true },
  rackId: { type: Schema.Types.ObjectId, ref: 'LibraryRack', required: true },
  shelfNumber: { type: String, required: true },
  label: String,
  capacity: Number,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
}, { timestamps: true });
ShelfSchema.index({ tenantId: 1, libraryId: 1, rackId: 1, shelfNumber: 1 }, { unique: true });
ShelfSchema.plugin(softDeletePlugin);

export const LibrarySection = (mongoose.models['LibrarySection'] || mongoose.model<ILibrarySection>('LibrarySection', SectionSchema)) as any;
export const LibraryRack = (mongoose.models['LibraryRack'] || mongoose.model<ILibraryRack>('LibraryRack', RackSchema)) as any;
export const LibraryShelf = (mongoose.models['LibraryShelf'] || mongoose.model<ILibraryShelf>('LibraryShelf', ShelfSchema)) as any;
