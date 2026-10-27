import { Request, Response } from 'express';
import SaasPayment from '../models/Payment.model';
import SaasInvoice from '../models/Invoice.model';
import PlatformAuditLog from '../models/PlatformAuditLog.model';

// @desc    Get all payments
// @route   GET /api/v1/super-admin/payments
export const getPayments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const query: any = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.tenantId) query.tenantId = req.query.tenantId;

    const [payments, total] = await Promise.all([
      SaasPayment.find(query)
        .populate('tenantId', 'name code')
        .populate('invoiceId', 'invoiceNumber total')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      SaasPayment.countDocuments(query)
    ]);

    res.json({ success: true, data: payments, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch payments' });
  }
};

// @desc    Record a manual payment
// @route   POST /api/v1/super-admin/payments
export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { tenantId, invoiceId, amount, currency, paymentMethod, provider, providerTransactionId, paymentDate, notes } = req.body;

    const payment = await SaasPayment.create({
      tenantId, invoiceId, amount,
      currency: currency || 'INR',
      paymentMethod: paymentMethod || 'MANUAL',
      provider: provider || 'MANUAL',
      providerTransactionId,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      status: 'SUCCESS',
      notes,
      createdBy: (req as any).user?._id,
    });

    // Update invoice if provided
    if (invoiceId) {
      const invoice = await SaasInvoice.findById(invoiceId);
      if (invoice) {
        const newPaid = (invoice.paidAmount || 0) + amount;
        invoice.paidAmount = newPaid;
        invoice.status = newPaid >= invoice.total ? 'PAID' : 'PARTIALLY_PAID';
        if (invoice.status === 'PAID') invoice.paidAt = new Date();
        await invoice.save();
      }
    }

    const actor = (req as any).user;
    await PlatformAuditLog.create({ actor: actor._id, actorEmail: actor.email, action: 'PAYMENT_RECORDED', entityType: 'SaasPayment', entityId: String(payment._id), tenantId, description: `Manual payment of ${amount} ${currency || 'INR'} recorded` });

    res.status(201).json({ success: true, data: payment, message: 'Payment recorded.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to record payment' });
  }
};

// @desc    Get payment by ID
// @route   GET /api/v1/super-admin/payments/:id
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await SaasPayment.findById(req.params.id)
      .populate('tenantId', 'name code adminEmail')
      .populate('invoiceId', 'invoiceNumber total status');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch payment' });
  }
};
