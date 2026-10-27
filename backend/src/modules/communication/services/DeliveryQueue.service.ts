import mongoose from 'mongoose';
import ScheduledCommunication from '../models/ScheduledCommunication.model';
import CommunicationDelivery from '../models/CommunicationDelivery.model';
import Communication from '../models/Communication.model';
import { providers } from './ChannelProviders';

export class DeliveryQueueService {
  
  // Extremely basic interval-based queue runner for demonstration purposes since we don't have BullMQ/Redis
  static startQueueWorker() {
    setInterval(async () => {
      await this.processScheduled();
      await this.processDeliveries();
    }, 10000); // run every 10 seconds
  }

  static async processScheduled() {
    const pending = await ScheduledCommunication.find({
      status: 'PENDING',
      scheduledFor: { $lte: new Date() }
    }).limit(10);

    for (const task of pending) {
      task.status = 'PROCESSING';
      await task.save();

      try {
        const comm = await Communication.findById(task.communicationId);
        if (comm && comm.status === 'SCHEDULED') {
          // Generate deliveries
          for (const recipientId of comm.recipientSnapshot) {
            for (const channel of comm.channels) {
              await CommunicationDelivery.create({
                tenantId: comm.tenantId,
                communicationId: comm._id,
                recipientId,
                channel,
                status: 'QUEUED'
              });
            }
          }
          comm.status = 'PUBLISHED';
          comm.publishedAt = new Date();
          await comm.save();
        }
        
        task.status = 'COMPLETED';
        task.executedAt = new Date();
        await task.save();
      } catch (error) {
        console.error('Error processing scheduled communication', error);
        task.status = 'FAILED';
        await task.save();
      }
    }
  }

  static async processDeliveries() {
    const batch = await CommunicationDelivery.find({ status: 'QUEUED' }).limit(50).populate('communicationId');
    
    for (const delivery of batch) {
      delivery.status = 'PROCESSING';
      await delivery.save();

      try {
        const comm: any = delivery.communicationId;
        const provider = (providers as any)[delivery.channel];
        
        if (provider) {
          const result = await provider.send(
            delivery.recipientId.toString(),
            comm.title,
            comm.content,
            comm.attachments
          );

          if (result.success) {
            delivery.status = 'DELIVERED';
            delivery.providerMessageId = result.messageId;
            delivery.deliveredAt = new Date();
          } else {
            throw new Error(result.error);
          }
        } else {
          throw new Error('Unknown channel provider');
        }

      } catch (error: any) {
        delivery.status = 'FAILED';
        delivery.failureReason = error.message;
        delivery.failedAt = new Date();
        delivery.retryCount += 1;
        // In a real system, we'd enqueue for retry if transient
      }
      
      await delivery.save();
    }
  }
}
