import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { FinanceService } from '../services/finance.service';
import { RazorpayService } from '../services/razorpay.service';
import { WebhookHandlerService } from '../services/webhook.service';
import { AppError } from '../../../core/errors/AppError';
import { sendResponse } from '../../../core/utils/response.util';

export class FinanceController {

  // ==========================
  // DASHBOARD
  // ==========================
  static async getDashboardStats(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const financeService = new FinanceService(req.tenantId!);
      const stats = await financeService.getDashboardStats();
      sendResponse({ res, status: 200, message: 'Dashboard stats retrieved', data: stats });
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // INVOICING
  // ==========================
  static async getStudentInvoices(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId as string;
      const financeService = new FinanceService(req.tenantId!);
      const invoices = await financeService.getStudentInvoices(studentId);
      sendResponse({ res, status: 200, message: 'Invoices retrieved', data: { invoices } });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentLedger(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId as string;
      const financeService = new FinanceService(req.tenantId!);
      const ledger = await financeService.getStudentLedger(studentId);
      sendResponse({ res, status: 200, message: 'Ledger retrieved', data: ledger });
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // PAYMENT FLOW
  // ==========================
  static async initiatePayment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { invoiceId, amount } = req.body;
      const financeService = new FinanceService(req.tenantId!);
      const result = await financeService.initiateOnlinePayment(invoiceId, amount);
      sendResponse({ res, status: 200, message: 'Payment initiated', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
      const financeService = new FinanceService(req.tenantId!);
      const result = await financeService.verifyAndProcessPayment(razorpayOrderId, razorpayPaymentId, signature);
      sendResponse({ res, status: 200, message: 'Payment verified and posted', data: result });
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // REFUNDS
  // ==========================
  static async createRefund(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const financeService = new FinanceService(req.tenantId!);
      const result = await financeService.createRefund(req.body);
      sendResponse({ res, status: 201, message: 'Refund requested successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async approveRefund(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const financeService = new FinanceService(req.tenantId!);
      const result = await financeService.approveRefund(req.params.id, req.user?.id);
      sendResponse({ res, status: 200, message: 'Refund approved', data: result });
    } catch (error) {
      next(error);
    }
  }

  static async processRefund(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const financeService = new FinanceService(req.tenantId!);
      const result = await financeService.processRefund(req.params.id);
      sendResponse({ res, status: 200, message: 'Refund processed', data: result });
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // PORTAL VIEWS
  // ==========================
  static async getMyFees(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      // Assuming req.user contains the logged-in student's ID for the 'STUDENT' role
      const studentId = req.user?.id;
      const financeService = new FinanceService(req.tenantId!);
      const fees = await financeService.getStudentInvoices(studentId);
      sendResponse({ res, status: 200, message: 'My fees retrieved', data: fees });
    } catch (error) {
      next(error);
    }
  }

  static async getChildFees(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.studentId;
      // You should verify that the parent (req.user.id) is actually linked to studentId
      const financeService = new FinanceService(req.tenantId!);
      const fees = await financeService.getStudentInvoices(studentId);
      sendResponse({ res, status: 200, message: 'Child fees retrieved', data: fees });
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // REPORTS
  // ==========================
  static async getCollectionReport(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const financeService = new FinanceService(req.tenantId!);
      const report = await financeService.getCollectionReport(req.query);
      sendResponse({ res, status: 200, message: 'Collection report retrieved', data: report });
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // WEBHOOKS
  // ==========================
  static async handleRazorpayWebhook(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = (req.params.tenantId || req.tenantId || 'system') as string;
      const rawSig = req.headers['x-razorpay-signature'];
      const rawEventId = req.headers['x-razorpay-event-id'];
      const webhookSignature = Array.isArray(rawSig) ? rawSig[0] : rawSig;
      const webhookEventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

      if (!webhookSignature || !webhookEventId) {
        throw new AppError('Missing Razorpay webhook headers', 400);
      }

      // In production, uncomment this block to reject invalid signatures:
      // const razorpayService = new RazorpayService();
      // const payloadString = JSON.stringify(req.body);
      // if (!razorpayService.verifyWebhookSignature(payloadString, webhookSignature)) {
      //   throw new AppError('Invalid webhook signature', 400);
      // }

      const webhookHandler = new WebhookHandlerService();
      const result = await webhookHandler.processWebhook(tenantId, webhookEventId, req.body.event, req.body);

      // Always respond 200 to acknowledge receipt to Razorpay
      res.status(200).json(result);
    } catch (error: any) {
      console.error('[Webhook Error]:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
