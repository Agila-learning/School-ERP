import { AlumniProfile, AlumniBatch, AlumniEducation, AlumniCareer, AlumniSkill, AlumniAchievement } from '../models/AlumniCore.model';
import mongoose from 'mongoose';

export class AlumniProfileService {
  /**
   * Converts a student to an alumni.
   * Assumes studentId and userId are passed in.
   */
  async convertStudentToAlumni(data: any) {
    const existing = await AlumniProfile.findOne({
      tenantId: data.tenantId,
      studentId: data.studentId
    });

    if (existing) {
      throw new Error('Alumni profile already exists for this student');
    }

    const alumniId = `ALM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newProfile = new AlumniProfile({
      ...data,
      alumniId,
      verificationStatus: 'Pending',
      engagementStatus: 'Active',
      privacySettings: {
        profileVisibility: 'Alumni Only',
        contactVisibility: 'Private',
        careerVisibility: 'Alumni Only',
        educationVisibility: 'Alumni Only',
        locationVisibility: 'Alumni Only',
        linksVisibility: 'Alumni Only',
        mentorAvailability: false
      }
    });

    return await newProfile.save();
  }

  async getProfileById(tenantId: string, alumniProfileId: string, requestorId?: string) {
    const profile = await AlumniProfile.findOne({ _id: alumniProfileId, tenantId });
    if (!profile) throw new Error('Profile not found');
    
    // Privacy logic would go here: if requestor is different, check profileVisibility
    return profile;
  }

  async updatePrivacySettings(tenantId: string, alumniProfileId: string, settings: any) {
    return await AlumniProfile.findOneAndUpdate(
      { _id: alumniProfileId, tenantId },
      { $set: { privacySettings: settings } },
      { new: true }
    );
  }

  async addEducation(tenantId: string, alumniProfileId: string, data: any) {
    const education = new AlumniEducation({ ...data, tenantId, alumniProfileId });
    return await education.save();
  }

  async addCareer(tenantId: string, alumniProfileId: string, data: any) {
    const career = new AlumniCareer({ ...data, tenantId, alumniProfileId });
    return await career.save();
  }

  async searchDirectory(tenantId: string, filters: any, requestorRole: string) {
    // Basic filter: only show verified profiles unless admin
    const query: any = { tenantId, verificationStatus: 'Verified' };
    
    // Privacy filtering based on role
    if (requestorRole === 'ALUMNI') {
      query['privacySettings.profileVisibility'] = { $in: ['Public', 'Alumni Only'] };
    } else if (requestorRole !== 'SUPER_ADMIN' && requestorRole !== 'TENANT_ADMIN') {
      query['privacySettings.profileVisibility'] = 'Public';
    }
    
    if (filters.batchId) query.batchId = filters.batchId;
    if (filters.graduationYear) query.graduationYear = filters.graduationYear;
    
    return await AlumniProfile.find(query).populate('batchId').limit(100);
  }
}

export const alumniProfileService = new AlumniProfileService();
