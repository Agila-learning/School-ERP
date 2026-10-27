import mongoose from 'mongoose';
import User from '../../auth/models/User.model';
import StudentProfile from '../../students/models/StudentProfile.model';
import Parent from '../../students/models/Parent.model';
import GuardianRelationship from '../../students/models/GuardianRelationship.model';
import Employee from '../../hr/models/Employee.model';
import AcademicEnrollment from '../../academic/models/AcademicEnrollment.model';

export class AudienceResolverService {
  
  /**
   * Resolves audience configuration to a list of User ObjectIds (Recipients)
   */
  static async resolveAudience(tenantId: string, audienceConfig: any): Promise<mongoose.Types.ObjectId[]> {
    const config = audienceConfig || { targetType: 'ALL' };
    const { targetType = 'ALL', branchId, gradeId, sectionId, specificUsers } = config;
    let recipientIds: Set<string> = new Set();

    switch (targetType) {
      case 'ALL':
        const allUsers = await User.find({ tenantId, accountStatus: { $in: ['active', 'ACTIVE'] } }).select('_id');
        allUsers.forEach((u: any) => recipientIds.add(u._id.toString()));
        break;

      case 'STUDENTS':
        // Fetch active students
        const students = await User.find({ tenantId, accountStatus: { $in: ['active', 'ACTIVE'] } }).select('_id');
        students.forEach((u: any) => recipientIds.add(u._id.toString()));
        break;

      case 'PARENTS':
        const parents = await User.find({ tenantId, accountStatus: { $in: ['active', 'ACTIVE'] } }).select('_id');
        parents.forEach((u: any) => recipientIds.add(u._id.toString()));
        break;

      case 'TEACHERS':
      case 'EMPLOYEES':
        const employees = await User.find({ tenantId, accountStatus: { $in: ['active', 'ACTIVE'] } }).select('_id');
        employees.forEach((u: any) => recipientIds.add(u._id.toString()));
        break;

      case 'CLASS':
      case 'SECTION':
      case 'GRADE':
        if (!sectionId || sectionId.length === 0) break;
        // Find enrollments in these sections
        const enrollments = await AcademicEnrollment.find({
          tenantId,
          sectionId: { $in: sectionId },
          status: 'ACTIVE'
        });
        const studentIds = enrollments.map((e: any) => e.studentId);
        
        const studentProfiles = await StudentProfile.find({ _id: { $in: studentIds } });
        studentProfiles.forEach((s: any) => {
          if (s.userId) recipientIds.add(s.userId.toString());
        });

        // Add parent User IDs (via relationships)
        const relationships = await GuardianRelationship.find({
          tenantId,
          studentId: { $in: studentIds },
          status: 'ACTIVE'
        });
        const parentIds = relationships.map((r: any) => r.parentId);
        const parentProfiles = await Parent.find({ _id: { $in: parentIds } });
        parentProfiles.forEach((p: any) => {
          if (p.userId) recipientIds.add(p.userId.toString());
        });
        break;

      case 'CUSTOM':
        if (specificUsers && specificUsers.length > 0) {
          const users = await User.find({ _id: { $in: specificUsers }, tenantId, status: 'ACTIVE' }).select('_id');
          users.forEach((u: any) => recipientIds.add(u._id.toString()));
        }
        break;
    }

    return Array.from(recipientIds).map(id => new mongoose.Types.ObjectId(id));
  }
}
