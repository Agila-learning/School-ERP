import RazorpayWebhookEvent from '../models/RazorpayWebhookEvent.model';
import RazorpaySettlement from '../models/RazorpaySettlement.model';
import RazorpayRefund from '../models/RazorpayRefund.model';
import { FinanceService } from './finance.service';
import mongoose from 'mongoose';

/**
 * Handles Webhook idempotency and dispatches to FinanceService.
 */
export class WebhookHandlerService {
  /**
   * Process a webhook event idempotently
   */
  async processWebhook(tenantId: string, eventId: string, eventName: string, payload: any) {
    // 1. Idempotency Check
    const existingEvent = await RazorpayWebhookEvent.findOne({ eventId });
    if (existingEvent) {
      return { status: 'acknowledged', reason: 'already_processed' };
    }

    const webhookEvent = await RazorpayWebhookEvent.create({
      eventId,
      event: eventName,
      status: 'PROCESSING',
    });

    try {
      const financeService = new FinanceService(tenantId);

      if (eventName === 'payment.captured') {
        const paymentData = payload.payload.payment.entity;
        // In reality we'd have a webhook-specific fulfillment method on FinanceService.
        console.log(`[Webhook] Fulfilling payment ${paymentData.id} for order ${paymentData.order_id}`);
      }
      
      else if (eventName === 'settlement.processed') {
        const stl = payload.payload.settlement.entity;
        await RazorpaySettlement.create({
          tenantId: new mongoose.Types.ObjectId(tenantId),
          razorpaySettlementId: stl.id,
          amount: stl.amount,
          fees: stl.fees,
          tax: stl.tax,
          netAmount: stl.amount - stl.fees - stl.tax,
          status: stl.status,
          utr: stl.utr,
        });
      }

      else if (eventName === 'refund.processed') {
        const rfnd = payload.payload.refund.entity;
        await RazorpayRefund.updateOne(
          { razorpayRefundId: rfnd.id, tenantId: new mongoose.Types.ObjectId(tenantId) },
          { status: 'PROCESSED' }
        );
      }

      webhookEvent.status = 'PROCESSED';
      await webhookEvent.save();

      return { status: 'success' };
    } catch (error: any) {
      webhookEvent.status = 'FAILED';
      webhookEvent.error = error.message;
      await webhookEvent.save();
      throw error;
    }
  }
}
