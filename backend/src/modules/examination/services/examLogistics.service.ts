import { Types } from 'mongoose';
import ExamRoomModel, { IExamRoom } from '../models/ExamRoom.model';
import ExamInvigilatorModel, { IExamInvigilator } from '../models/ExamInvigilator.model';
import ExamSeatingPlanModel, { IExamSeatingPlan } from '../models/ExamSeatingPlan.model';
import { ValidationError } from '../../../core/errors/AppError';

export class ExamLogisticsService {
  
  // =====================
  // ROOMS
  // =====================
  static async addRoom(tenantId: string, data: Partial<IExamRoom>): Promise<IExamRoom> {
    const room = new ExamRoomModel({ ...data, tenantId });
    return await room.save();
  }

  static async getRooms(tenantId: string, filters: any = {}): Promise<IExamRoom[]> {
    return await ExamRoomModel.find({ tenantId, isDeleted: false, ...filters });
  }

  // =====================
  // INVIGILATORS
  // =====================
  static async assignInvigilator(tenantId: string, examId: string, scheduleId: string, roomId: string, staffId: string, role: string): Promise<IExamInvigilator> {
    // 1. Conflict detection (is this staff already assigned to this schedule?)
    const conflict = await ExamInvigilatorModel.findOne({ tenantId, scheduleId, staffId, isDeleted: false });
    if (conflict) {
      throw new ValidationError('Staff is already assigned to this exam schedule');
    }

    const assignment = new ExamInvigilatorModel({
      tenantId, examId, scheduleId, roomId, staffId, role
    });
    return await assignment.save();
  }

  // =====================
  // SEATING PLAN
  // =====================
  static async generateSeatingPlan(tenantId: string, examId: string, scheduleId: string, roomIds: string[], studentIds: string[], strategy: 'SEQUENTIAL' | 'RANDOM'): Promise<IExamSeatingPlan[]> {
    const rooms = await ExamRoomModel.find({ _id: { $in: roomIds }, tenantId, isDeleted: false });
    if (!rooms.length) throw new ValidationError('No valid rooms found');

    let totalCapacity = rooms.reduce((sum: number, r: any) => sum + r.capacity, 0);
    if (studentIds.length > totalCapacity) {
      throw new ValidationError(`Insufficient capacity. Required: ${studentIds.length}, Available: ${totalCapacity}`);
    }

    let studentsToSeat = [...studentIds];
    if (strategy === 'RANDOM') {
      studentsToSeat = studentsToSeat.sort(() => Math.random() - 0.5);
    }

    const plans: IExamSeatingPlan[] = [];
    let studentIndex = 0;

    for (const room of rooms) {
      for (let i = 1; i <= room.capacity; i++) {
        if (studentIndex >= studentsToSeat.length) break;

        const plan = new ExamSeatingPlanModel({
          tenantId,
          examId,
          scheduleId,
          roomId: room._id,
          studentId: studentsToSeat[studentIndex],
          seatNumber: `R${room.code}-S${i}`,
        });
        
        // Wait, realistically we'd save these in bulk
        plans.push(plan);
        studentIndex++;
      }
    }

    // Use bulk write for performance
    if (plans.length > 0) {
      await ExamSeatingPlanModel.insertMany(plans);
    }

    return plans;
  }
}
