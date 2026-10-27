import { BaseRepository } from '../../../core/repositories/base.repository';
import MasterData, { IMasterData } from '../models/MasterData.model';

export class MasterDataRepository extends BaseRepository<IMasterData> {
  constructor(tenantId: string) {
    super(MasterData, tenantId);
  }

  async findByType(type: string): Promise<{ data: IMasterData[]; total: number }> {
    return this.find({ type, isActive: true });
  }
}
