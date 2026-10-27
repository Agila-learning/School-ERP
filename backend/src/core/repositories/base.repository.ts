import mongoose, { Model, Document, ClientSession } from 'mongoose';
import { ISoftDeleted } from '../plugins/softDelete.plugin';

export class BaseRepository<T extends Document & ISoftDeleted> {
  protected model: Model<T>;
  protected tenantId: string;

  constructor(model: Model<T>, tenantId: string) {
    this.model = model;
    this.tenantId = tenantId;
  }

  protected getTenantFilter(filter: Record<string, any> = {}): Record<string, any> {
    return { ...filter, tenantId: this.tenantId };
  }

  async runInTransaction<R>(fn: (session: ClientSession) => Promise<R>): Promise<R> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne(this.getTenantFilter({ _id: id }));
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOne(this.getTenantFilter(filter));
  }

  async find(filter: Record<string, any> = {}, skip = 0, limit = 10): Promise<{ data: T[]; total: number }> {
    const tenantFilter = this.getTenantFilter(filter);
    const [data, total] = await Promise.all([
      this.model.find(tenantFilter).skip(skip).limit(limit).exec(),
      this.model.countDocuments(tenantFilter).exec(),
    ]);
    return { data, total };
  }

  async create(data: Partial<T>, session?: ClientSession): Promise<T> {
    const documents = await this.model.create([{ ...data, tenantId: this.tenantId }] as any, { session });
    return documents[0];
  }

  async update(id: string, data: Record<string, any>, session?: ClientSession): Promise<T | null> {
    return this.model.findOneAndUpdate(
      this.getTenantFilter({ _id: id }),
      data,
      { new: true, session }
    );
  }

  /**
   * Soft Deletes the document instead of physically removing it.
   */
  async delete(id: string, deletedBy?: string, session?: ClientSession): Promise<T | null> {
    return this.model.findOneAndUpdate(
      this.getTenantFilter({ _id: id }),
      { isDeleted: true, deletedAt: new Date(), deletedBy } as any,
      { new: true, session }
    );
  }

  /**
   * Hard Delete - Danger! Only use for compliance/GDPR.
   */
  async hardDelete(id: string, session?: ClientSession): Promise<T | null> {
    return this.model.findOneAndDelete(this.getTenantFilter({ _id: id }), { session });
  }
}
