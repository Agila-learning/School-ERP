import { BaseRepository } from '../../../core/repositories/base.repository';
import Setting, { ISetting } from '../models/Setting.model';
import mongoose from 'mongoose';

export class SettingRepository extends BaseRepository<ISetting> {
  constructor(tenantId: string) {
    super(Setting, tenantId);
  }

  async findByGroup(group: string): Promise<{ data: ISetting[]; total: number }> {
    return this.find({ group });
  }

  async findByKey(key: string): Promise<ISetting | null> {
    return this.findOne({ key });
  }

  async upsertByKey(key: string, data: Partial<ISetting>): Promise<ISetting> {
    const existing = await this.findByKey(key);
    if (existing) {
      return this.update(existing._id.toString(), data) as Promise<ISetting>;
    }
    return this.create({ key, ...data }) as Promise<ISetting>;
  }
}
