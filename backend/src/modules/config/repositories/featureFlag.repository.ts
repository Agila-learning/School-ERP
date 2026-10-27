import { BaseRepository } from '../../../core/repositories/base.repository';
import FeatureFlag, { IFeatureFlag } from '../models/FeatureFlag.model';

export class FeatureFlagRepository extends BaseRepository<IFeatureFlag> {
  constructor(tenantId: string) {
    super(FeatureFlag, tenantId);
  }

  async isEnabled(featureKey: string): Promise<boolean> {
    const flag = await this.findOne({ featureKey });
    return flag ? flag.isEnabled : false;
  }
}
