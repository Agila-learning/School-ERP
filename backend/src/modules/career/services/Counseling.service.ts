import { CounselingAppointment, CounselingNote } from '../models/CareerCounseling.model';

export class CounselingService {
  async bookAppointment(tenantId: string, studentId: string, data: any) {
    // Conflict check is also enforced by DB unique index (tenantId, counselorId, date, startTime)
    try {
      const appointment = new CounselingAppointment({
        ...data,
        tenantId,
        studentId,
        status: 'Requested'
      });
      return await appointment.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('This time slot is already booked for this counselor.');
      }
      throw error;
    }
  }

  async addCounselingNote(tenantId: string, counselorId: string, data: any) {
    const note = new CounselingNote({
      ...data,
      tenantId,
      counselorId
    });
    return await note.save();
  }

  async getNotesForStudent(tenantId: string, studentId: string, requesterRole: string) {
    // Strict visibility check
    const query: any = { tenantId, studentId };
    
    if (requesterRole === 'Student') {
      query.visibility = 'Shared with Student';
    } else if (requesterRole === 'Parent') {
      query.visibility = 'Shared with Parent';
    }
    // Admin or Counselor can see all
    
    return await CounselingNote.find(query).sort({ createdAt: -1 });
  }
}

export const counselingService = new CounselingService();
