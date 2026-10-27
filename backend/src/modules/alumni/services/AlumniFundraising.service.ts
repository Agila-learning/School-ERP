import { AlumniCampaign, AlumniContribution } from '../models/AlumniFundraising.model';

export class AlumniFundraisingService {
  async createCampaign(tenantId: string, data: any) {
    const campaign = new AlumniCampaign({ ...data, tenantId });
    return await campaign.save();
  }

  async getActiveCampaigns(tenantId: string) {
    return await AlumniCampaign.find({ tenantId, status: 'Active' });
  }

  async logContribution(tenantId: string, data: any) {
    const contribution = new AlumniContribution({ ...data, tenantId });
    await contribution.save();

    if (contribution.status === 'Completed') {
      await AlumniCampaign.findByIdAndUpdate(
        data.campaignId,
        { $inc: { raisedAmount: data.amount } }
      );
    }

    return contribution;
  }
}

export const alumniFundraisingService = new AlumniFundraisingService();
