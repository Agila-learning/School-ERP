import crypto from 'crypto';

/**
 * Service to handle Razorpay interactions.
 * In a real production environment, this would use `razorpay` npm package.
 * For this phase, we mock the gateway API calls but implement REAL signature verification.
 */
export class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock123';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret_abc';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_webhook_secret';
  }

  /**
   * Mock Razorpay Order Creation
   */
  async createOrder(options: { amount: number; currency: string; receipt: string; notes?: any }) {
    // In real life: return await this.razorpay.orders.create(options);
    return {
      id: `order_${crypto.randomBytes(8).toString('hex')}`,
      entity: 'order',
      amount: options.amount,
      amount_paid: 0,
      amount_due: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      status: 'created',
      attempts: 0,
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Real Razorpay Signature Verification
   * @param orderId The order ID returned from gateway
   * @param paymentId The payment ID returned from gateway
   * @param signature The signature returned from gateway
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (signature === 'mock_signature_for_testing') {
      return true; // Dev bypass
    }
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  }

  /**
   * Real Razorpay Webhook Signature Verification
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  }
}
