import mongoose from 'mongoose';
import { SafetyIncident, EmergencyEvent, EvacuationEvent, AccountabilityRecord } from '../models/Emergency.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class EmergencyOperationsService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  private get tid() {
    return new mongoose.Types.ObjectId(this.tenantId);
  }

  // --- INCIDENTS ---
  async getIncidents() {
    return await SafetyIncident.find({ tenantId: this.tid, isDeleted: { $ne: true } })
      .populate('reportedByUserId', 'firstName lastName')
      .populate('assignedInvestigatorId', 'firstName lastName');
  }

  async reportIncident(data: any, reportedByUserId: string) {
    const incidentNumber = 'INC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return await SafetyIncident.create({
      ...data,
      incidentNumber,
      reportedByUserId: new mongoose.Types.ObjectId(reportedByUserId),
      tenantId: this.tid
    });
  }

  // --- EMERGENCIES ---
  async getActiveEmergencies() {
    return await EmergencyEvent.find({ 
      tenantId: this.tid, 
      state: { $nin: ['Resolved', 'Closed'] }, 
      isDeleted: { $ne: true } 
    }).populate('declaredByUserId', 'firstName lastName');
  }

  async declareEmergency(data: any, declaredByUserId: string) {
    const event = await EmergencyEvent.create({
      ...data,
      declaredByUserId: new mongoose.Types.ObjectId(declaredByUserId),
      timeStarted: new Date(),
      tenantId: this.tid
    });

    // In a real system, trigger mass notification idempotently here
    return event;
  }

  async updateEmergencyState(eventId: string, state: string) {
    const event = await EmergencyEvent.findOneAndUpdate(
      { _id: eventId, tenantId: this.tid },
      { state },
      { new: true }
    );
    if (!event) throw new NotFoundError('Emergency not found');
    return event;
  }

  // --- EVACUATION & ACCOUNTABILITY ---
  async getEvacuations(emergencyEventId?: string) {
    const q: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (emergencyEventId) q.emergencyEventId = new mongoose.Types.ObjectId(emergencyEventId);
    return await EvacuationEvent.find(q);
  }

  async startEvacuation(emergencyEventId: string, data: any, coordinatorId: string) {
    return await EvacuationEvent.create({
      ...data,
      emergencyEventId: new mongoose.Types.ObjectId(emergencyEventId),
      coordinatorId: new mongoose.Types.ObjectId(coordinatorId),
      startTime: new Date(),
      status: 'In Progress',
      tenantId: this.tid
    });
  }

  async updateAccountability(evacuationEventId: string, records: any[], recordedByUserId: string) {
    // records is an array of { personId, personType, status }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const results = [];
      for (const rec of records) {
        const updated = await AccountabilityRecord.findOneAndUpdate(
          { 
            tenantId: this.tid, 
            evacuationEventId: new mongoose.Types.ObjectId(evacuationEventId),
            personId: new mongoose.Types.ObjectId(rec.personId)
          },
          {
            personType: rec.personType,
            status: rec.status,
            recordedByUserId: new mongoose.Types.ObjectId(recordedByUserId),
            timestamp: new Date()
          },
          { new: true, upsert: true, session }
        );
        results.push(updated);
      }
      await session.commitTransaction();
      return results;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getAccountabilityReport(evacuationEventId: string) {
    return await AccountabilityRecord.find({ 
      tenantId: this.tid, 
      evacuationEventId: new mongoose.Types.ObjectId(evacuationEventId),
      isDeleted: { $ne: true }
    });
  }
}
