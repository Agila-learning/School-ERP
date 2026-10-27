import { Request, Response } from 'express';
import SaasInvoice from '../models/Invoice.model';
import TenantSubscription from '../../tenant/models/TenantSubscription.model';
import Tenant from '../../tenant/models/Tenant.model';
import PlatformAuditLog from '../models/PlatformAuditLog.model';

const generateInvoiceNumber = async (): Promise<string> => {
  const count = await SaasInvoice.countDocuments();
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
};

// @desc    Get all invoices
// @route   GET /api/v1/super-admin/invoices
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.tenantId) query.tenantId = req.query.tenantId;

    const [invoices, total] = await Promise.all([
      SaasInvoice.find(query)
        .populate('tenantId', 'name code')
        .populate('subscriptionId', 'status billingCycle')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      SaasInvoice.countDocuments(query)
    ]);

    res.json({ success: true, data: invoices, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch invoices' });
  }
};

// @desc    Get single invoice
// @route   GET /api/v1/super-admin/invoices/:id
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await SaasInvoice.findById(req.params.id)
      .populate('tenantId', 'name code adminEmail adminName address city state country')
      .populate('subscriptionId').populate('planId', 'name');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch invoice' });
  }
};

// @desc    Generate invoice for a subscription
// @route   POST /api/v1/super-admin/invoices/generate
export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const { tenantId, subscriptionId, planId, dueInDays = 7, taxRate = 18, notes } = req.body;

    const sub = await TenantSubscription.findById(subscriptionId).populate('planId');
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const plan: any = sub.planId;
    const subtotal = sub.finalAmount;
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const total = subtotal + taxAmount;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueInDays);
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await SaasInvoice.create({
      invoiceNumber,
      tenantId,
      subscriptionId,
      planId: plan?._id || planId,
      billingPeriodStart: sub.startDate,
      billingPeriodEnd: sub.endDate,
      invoiceDate: new Date(),
      dueDate,
      lineItems: [{ description: `${plan?.name || 'Subscription'} - ${sub.billingCycle}`, quantity: 1, unitPrice: subtotal, amount: subtotal }],
      subtotal,
      taxRate,
      taxAmount,
      total,
      currency: 'INR',
      status: 'ISSUED',
      notes,
      createdBy: (req as any).user?._id,
    });

    const actor = (req as any).user;
    await PlatformAuditLog.create({ actor: actor._id, actorEmail: actor.email, action: 'INVOICE_GENERATED', entityType: 'SaasInvoice', entityId: String(invoice._id), tenantId, description: `Invoice ${invoiceNumber} generated` });

    res.status(201).json({ success: true, data: invoice, message: `Invoice ${invoiceNumber} generated.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate invoice' });
  }
};

// @desc    Update invoice status
// @route   PATCH /api/v1/super-admin/invoices/:id/status
export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { status, paidAmount, paidAt } = req.body;
    const invoice = await SaasInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const validStatuses = ['DRAFT', 'ISSUED', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    invoice.status = status;
    if (paidAmount !== undefined) invoice.paidAmount = paidAmount;
    if (status === 'PAID') invoice.paidAt = paidAt ? new Date(paidAt) : new Date();
    await invoice.save();

    res.json({ success: true, data: invoice, message: 'Invoice status updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update invoice' });
  }
};

// @desc    Cancel invoice
// @route   DELETE /api/v1/super-admin/invoices/:id
export const cancelInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await SaasInvoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    if (invoice.status === 'PAID') return res.status(400).json({ success: false, message: 'Cannot cancel a paid invoice.' });

    invoice.status = 'CANCELLED';
    await invoice.save();
    res.json({ success: true, message: 'Invoice cancelled.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to cancel invoice' });
  }
};
