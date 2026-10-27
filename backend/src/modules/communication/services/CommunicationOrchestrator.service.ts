import mongoose from 'mongoose';
import Communication from '../models/Communication.model';
import ScheduledCommunication from '../models/ScheduledCommunication.model';
import CommunicationDelivery from '../models/CommunicationDelivery.model';
import { AudienceResolverService } from './AudienceResolver.service';
import { ValidationError, NotFoundError } from '../../../core/errors/AppError';
import { AuditService } from '../../audit/services/audit.service';

export class CommunicationOrchestratorService {
  
  static async createCommunication(tenantId: string, data: any, userId: string) {
    const audienceConfig = data.audienceConfig || { targetType: 'ALL' };
    const type = data.type || 'ANNOUNCEMENT';
    const channels = (data.channels || ['IN_APP', 'PUSH']).map((c: string) => c === 'APP_PUSH' ? 'PUSH' : c);
    const status = data.status || 'PUBLISHED';

    // 1. Resolve Audience Snapshot
    const recipientIds = await AudienceResolverService.resolveAudience(tenantId, audienceConfig);

    const toId = (val: any) => (val && mongoose.isValidObjectId(val) ? new mongoose.Types.ObjectId(val) : val);

    // 2. Create the Communication
    const comm = await Communication.create({
      ...data,
      type,
      audienceConfig,
      channels,
      status,
      tenantId: toId(tenantId),
      recipientSnapshot: recipientIds,
      createdBy: toId(userId)
    });

    if (userId) {
      AuditService.log({ tenantId, action: 'CREATE', entityType: 'Communication', entityId: comm._id.toString(), performedBy: userId.toString() });
    }

    return comm;
  }

  static async approveAndDispatch(tenantId: string, commId: string, userId: string) {
    const comm = await Communication.findOne({ _id: commId, tenantId });
    if (!comm) throw new NotFoundError('Communication not found');
    if (comm.status !== 'DRAFT' && comm.status !== 'PENDING_APPROVAL') {
      throw new ValidationError('Only Draft or Pending communications can be dispatched');
    }

    comm.approvedBy = new mongoose.Types.ObjectId(userId);

    if (comm.scheduledFor && new Date(comm.scheduledFor) > new Date()) {
      // Schedule it
      comm.status = 'SCHEDULED';
      await ScheduledCommunication.create({
        tenantId,
        communicationId: comm._id,
        scheduledFor: comm.scheduledFor,
        createdBy: new mongoose.Types.ObjectId(userId)
      });
    } else {
      // Dispatch immediately
      comm.status = 'PUBLISHED';
      comm.publishedAt = new Date();
      
      // Queue deliveries directly
      const deliveries = [];
      for (const recipientId of comm.recipientSnapshot) {
        for (const channel of comm.channels) {
          deliveries.push({
            tenantId,
            communicationId: comm._id,
            recipientId,
            channel,
            status: 'QUEUED'
          });
        }
      }
      
      if (deliveries.length > 0) {
        await CommunicationDelivery.insertMany(deliveries, { ordered: false });
      }
    }

    await comm.save();
    AuditService.log({ tenantId, action: 'UPDATE', entityType: 'Communication', entityId: commId, performedBy: userId });

    return comm;
  }
}
