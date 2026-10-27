import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { FeeService } from '../services/fee.service';
import { sendResponse } from '../../../core/utils/response.util';

export class FeeController {
  static async getFeeHeads(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const feeService = new FeeService(req.tenantId!);
      const feeHeads = await feeService.getFeeHeads();
      sendResponse({ res, status: 200, message: 'Fee heads retrieved', data: feeHeads });
    } catch (error) {
      next(error);
    }
  }

  static async createFeeHead(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const feeService = new FeeService(req.tenantId!);
      const feeHead = await feeService.createFeeHead(req.body);
      sendResponse({ res, status: 201, message: 'Fee head created', data: feeHead });
    } catch (error) {
      next(error);
    }
  }

  static async updateFeeHead(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feeService = new FeeService(req.tenantId!);
      const feeHead = await feeService.updateFeeHead(id, req.body);
      sendResponse({ res, status: 200, message: 'Fee head updated', data: feeHead });
    } catch (error) {
      next(error);
    }
  }

  static async deactivateFeeHead(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feeService = new FeeService(req.tenantId!);
      await feeService.deactivateFeeHead(id);
      sendResponse({ res, status: 200, message: 'Fee head deactivated' });
    } catch (error) {
      next(error);
    }
  }

  static async getFeeStructures(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const feeService = new FeeService(req.tenantId!);
      const structures = await feeService.getFeeStructures(req.query);
      sendResponse({ res, status: 200, message: 'Fee structures retrieved', data: structures });
    } catch (error) {
      next(error);
    }
  }

  static async createFeeStructure(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const feeService = new FeeService(req.tenantId!);
      const structure = await feeService.createFeeStructure(req.body);
      sendResponse({ res, status: 201, message: 'Fee structure created', data: structure });
    } catch (error) {
      next(error);
    }
  }

  static async updateFeeStructure(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feeService = new FeeService(req.tenantId!);
      const structure = await feeService.updateFeeStructure(id, req.body);
      sendResponse({ res, status: 200, message: 'Fee structure updated', data: structure });
    } catch (error) {
      next(error);
    }
  }

  static async deactivateFeeStructure(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feeService = new FeeService(req.tenantId!);
      await feeService.deactivateFeeStructure(id);
      sendResponse({ res, status: 200, message: 'Fee structure deactivated' });
    } catch (error) {
      next(error);
    }
  }

  static async generateInvoices(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { academicYearId, branchId, classId, dueDate } = req.body;
      const feeService = new FeeService(req.tenantId!);
      const invoices = await feeService.generateInvoicesForClass(academicYearId, branchId, classId, new Date(dueDate));
      sendResponse({ res, status: 201, message: 'Invoices generated successfully', data: invoices });
    } catch (error) {
      next(error);
    }
  }

  // --- SCHOLARSHIPS & DISCOUNTS ---
  static async getDiscounts(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const feeService = new FeeService(req.tenantId!);
      const discounts = await feeService.getDiscounts();
      sendResponse({ res, status: 200, message: 'Discounts retrieved', data: discounts });
    } catch (error) {
      next(error);
    }
  }

  static async createDiscount(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const feeService = new FeeService(req.tenantId!);
      const discount = await feeService.createDiscount(req.body);
      sendResponse({ res, status: 201, message: 'Discount created', data: discount });
    } catch (error) {
      next(error);
    }
  }

  static async updateDiscount(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feeService = new FeeService(req.tenantId!);
      const discount = await feeService.updateDiscount(id, req.body);
      sendResponse({ res, status: 200, message: 'Discount updated', data: discount });
    } catch (error) {
      next(error);
    }
  }

  static async deactivateDiscount(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const feeService = new FeeService(req.tenantId!);
      await feeService.deactivateDiscount(id);
      sendResponse({ res, status: 200, message: 'Discount deactivated' });
    } catch (error) {
      next(error);
    }
  }

  // --- AD-HOC FEES & ADJUSTMENTS ---
  static async assignFee(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { studentId, feeHeadId, amount, dueDate, academicYearId } = req.body;
      const feeService = new FeeService(req.tenantId!);
      const invoice = await feeService.assignFeeToStudent(studentId, feeHeadId, amount, new Date(dueDate), academicYearId);
      sendResponse({ res, status: 201, message: 'Fee assigned to student successfully', data: invoice });
    } catch (error) {
      next(error);
    }
  }

  static async adjustInvoice(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { discountAmount, reason } = req.body;
      const feeService = new FeeService(req.tenantId!);
      const invoice = await feeService.adjustInvoice(id, discountAmount, reason);
      sendResponse({ res, status: 200, message: 'Invoice adjusted successfully', data: invoice });
    } catch (error) {
      next(error);
    }
  }

  static async addFine(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { fineAmount, reason } = req.body;
      const feeService = new FeeService(req.tenantId!);
      const invoice = await feeService.addFine(id, fineAmount, reason);
      sendResponse({ res, status: 200, message: 'Fine added successfully', data: invoice });
    } catch (error) {
      next(error);
    }
  }
}
