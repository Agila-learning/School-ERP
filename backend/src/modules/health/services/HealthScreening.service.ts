import mongoose from 'mongoose';
import { HealthScreeningProgram, HealthScreeningSession, HealthScreeningResult } from '../models/HealthScreening.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class HealthScreeningService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return mongoose.isValidObjectId(this.tenantId) ? new mongoose.Types.ObjectId(this.tenantId) : this.tenantId;
  }

  // --- PROGRAMS ---
  async getPrograms() {
    return await HealthScreeningProgram.find({ tenantId: this.tid, isDeleted: { $ne: true } }).populate('providerId', 'providerName');
  }

  async createProgram(data: any) {
    return await HealthScreeningProgram.create({ ...data, tenantId: this.tid });
  }

  // --- SESSIONS ---
  async getSessions(programId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (programId) q.programId = new mongoose.Types.ObjectId(programId);
    return await HealthScreeningSession.find(q).populate('providerId', 'providerName');
  }

  async createSession(programId: string, data: any) {
    return await HealthScreeningSession.create({ 
      ...data, 
      programId: new mongoose.Types.ObjectId(programId),
      tenantId: this.tid 
    });
  }

  // --- RESULTS ---
  async getResults(studentId?: string, sessionId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (studentId) q.studentId = new mongoose.Types.ObjectId(studentId);
    if (sessionId) q.sessionId = new mongoose.Types.ObjectId(sessionId);
    return await HealthScreeningResult.find(q);
  }

  async recordResult(sessionId: string, studentId: string, data: any) {
    return await HealthScreeningResult.create({
      ...data,
      sessionId: new mongoose.Types.ObjectId(sessionId),
      studentId: new mongoose.Types.ObjectId(studentId),
      tenantId: this.tid
    });
  }
}
