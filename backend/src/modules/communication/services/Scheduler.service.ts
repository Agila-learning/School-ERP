import mongoose from 'mongoose';
import ScheduledCommunication from '../models/ScheduledCommunication.model';
import Communication from '../models/Communication.model';
import CommunicationDelivery from '../models/CommunicationDelivery.model';

export class SchedulerService {
  private intervalId?: NodeJS.Timeout;

  public startPolling(intervalMs: number = 60000) { // Default every 1 minute
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.processScheduledCommunications(), intervalMs);
    console.log('Communication Scheduler started.');
  }

  public stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private async processScheduledCommunications() {
    try {
      const now = new Date();
      // Find all scheduled communications that should be published now or earlier
      const pendingSchedules = await ScheduledCommunication.find({
        status: 'PENDING',
        scheduledFor: { $lte: now }
      });

      for (const schedule of pendingSchedules) {
        // Mark as processing to avoid duplicate runs
        schedule.status = 'PROCESSING';
        await schedule.save();

        const comm = await Communication.findById(schedule.communicationId);
        if (!comm) {
          schedule.status = 'FAILED';
          await schedule.save();
          continue;
        }

        // Dispatch logic
        comm.status = 'PUBLISHED';
        comm.publishedAt = now;
        
        const deliveries = [];
        for (const recipientId of comm.recipientSnapshot) {
          for (const channel of comm.channels) {
            deliveries.push({
              tenantId: comm.tenantId,
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

        await comm.save();

        schedule.status = 'COMPLETED';
        schedule.executedAt = now;
        await schedule.save();
        
        console.log(`Scheduled Communication ${comm._id} published.`);
      }
    } catch (error) {
      console.error('Error in Communication Scheduler:', error);
    }
  }
}

export const communicationScheduler = new SchedulerService();
