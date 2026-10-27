import { WellnessProgram, WellnessCampaign } from '../models/Wellness.model';
import mongoose from 'mongoose';

export class WellnessService {
  static async getPrograms(tenantId: string) {
    return WellnessProgram.find({ tenantId, deletedAt: null });
  }

  static async createProgram(tenantId: string, data: any) {
    const program = new WellnessProgram({
      tenantId: mongoose.isValidObjectId(tenantId) ? new mongoose.Types.ObjectId(tenantId) : tenantId,
      ...data
    });
    await program.save();
    return program;
  }

  static async getCampaigns(tenantId: string) {
    return WellnessCampaign.find({ tenantId, deletedAt: null }).populate('programId');
  }

  static async createCampaign(tenantId: string, data: any) {
    const campaign = new WellnessCampaign({
      tenantId: mongoose.isValidObjectId(tenantId) ? new mongoose.Types.ObjectId(tenantId) : tenantId,
      ...data
    });
    await campaign.save();
    return campaign;
  }
}
