import mongoose from 'mongoose';
import { 
  StudentHealthProfile, 
  StudentAllergy, 
  StudentMedicalCondition, 
  StudentVaccination,
  HealthAccommodation
} from '../models/HealthProfile.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class HealthProfileService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return mongoose.isValidObjectId(this.tenantId) ? new mongoose.Types.ObjectId(this.tenantId) : this.tenantId;
  }

  // --- HEALTH PROFILES ---
  async getProfile(studentId: string) {
    let profile = await StudentHealthProfile.findOne({ tenantId: this.tid, studentId: new mongoose.Types.ObjectId(studentId), isDeleted: { $ne: true } });
    if (!profile) {
      // Auto-create empty profile
      profile = await StudentHealthProfile.create({
        tenantId: this.tid,
        studentId: new mongoose.Types.ObjectId(studentId),
        status: 'INCOMPLETE'
      });
    }
    return profile;
  }

  async updateProfile(studentId: string, data: any) {
    const profile = await this.getProfile(studentId);
    Object.assign(profile, { ...data, lastUpdated: new Date() });
    return await profile.save();
  }

  // --- ALLERGIES ---
  async getAllergies(studentId: string) {
    return await StudentAllergy.find({ tenantId: this.tid, studentId: new mongoose.Types.ObjectId(studentId), isDeleted: { $ne: true } });
  }

  async addAllergy(studentId: string, data: any) {
    return await StudentAllergy.create({
      ...data,
      tenantId: this.tid,
      studentId: new mongoose.Types.ObjectId(studentId)
    });
  }

  // --- CONDITIONS ---
  async getConditions(studentId: string) {
    return await StudentMedicalCondition.find({ tenantId: this.tid, studentId: new mongoose.Types.ObjectId(studentId), isDeleted: { $ne: true } }).populate('verifiedByUserId', 'firstName lastName');
  }

  async addCondition(studentId: string, data: any) {
    return await StudentMedicalCondition.create({
      ...data,
      tenantId: this.tid,
      studentId: new mongoose.Types.ObjectId(studentId)
    });
  }

  // --- VACCINATIONS ---
  async getVaccinations(studentId: string) {
    return await StudentVaccination.find({ tenantId: this.tid, studentId: new mongoose.Types.ObjectId(studentId), isDeleted: { $ne: true } });
  }

  async addVaccination(studentId: string, data: any) {
    return await StudentVaccination.create({
      ...data,
      tenantId: this.tid,
      studentId: new mongoose.Types.ObjectId(studentId)
    });
  }

  // --- ACCOMMODATIONS ---
  async getAccommodations(studentId: string) {
    return await HealthAccommodation.find({ tenantId: this.tid, studentId: new mongoose.Types.ObjectId(studentId), isDeleted: { $ne: true } }).populate('authorizedBy', 'firstName lastName');
  }

  async addAccommodation(studentId: string, data: any) {
    return await HealthAccommodation.create({
      ...data,
      tenantId: this.tid,
      studentId: new mongoose.Types.ObjectId(studentId)
    });
  }
}
