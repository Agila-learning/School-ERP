import mongoose, { Document, Schema } from 'mongoose';

export interface IRazorpayWebhookEvent extends Document {
  id: string;
  eventId: string; // The x-razorpay-event-id
  event: string; // e.g. payment.captured
  receivedAt: Date;
  status: 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'IGNORED';
  error?: string;
}

const RazorpayWebhookEventSchema: Schema = new Schema(
  {
    eventId: { type: String, required: true, unique: true }, // Crucial for Idempotency
    event: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['PROCESSING', 'PROCESSED', 'FAILED', 'IGNORED'],
      default: 'PROCESSING',
    },
    error: String,
  },
  { timestamps: true }
);

export default (mongoose.models['RazorpayWebhookEvent'] || (mongoose.models['RazorpayWebhookEvent'] || mongoose.model<IRazorpayWebhookEvent>('RazorpayWebhookEvent', RazorpayWebhookEventSchema)) as any) as any;
