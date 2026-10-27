import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { AccountingService } from '../services/accounting.service';
import { sendResponse } from '../../../core/utils/response.util';

export class AccountingController {
  
  static async getChartOfAccounts(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new AccountingService(req.tenantId!);
      const accounts = await service.getChartOfAccounts();
      sendResponse({ res, status: 200, message: 'Chart of Accounts retrieved', data: accounts });
    } catch (error) {
      next(error);
    }
  }

  static async createAccount(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new AccountingService(req.tenantId!);
      const account = await service.createAccount(req.body);
      sendResponse({ res, status: 201, message: 'Account created', data: account });
    } catch (error) {
      next(error);
    }
  }

  static async updateAccount(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new AccountingService(req.tenantId!);
      const account = await service.updateAccount(req.params.id, req.body);
      sendResponse({ res, status: 200, message: 'Account updated', data: account });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new AccountingService(req.tenantId!);
      const account = await service.deleteAccount(req.params.id);
      sendResponse({ res, status: 200, message: 'Account deleted', data: account });
    } catch (error) {
      next(error);
    }
  }

  static async postJournal(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new AccountingService(req.tenantId!);
      const journal = await service.postJournal({
        ...req.body,
        postedBy: (req as any).user?._id
      });
      sendResponse({ res, status: 201, message: 'Journal posted successfully', data: journal });
    } catch (error) {
      next(error);
    }
  }

  static async getGeneralLedger(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const { startDate, endDate } = req.query;
      const service = new AccountingService(req.tenantId!);
      
      const parsedStart = startDate ? new Date(startDate.toString()) : undefined;
      const parsedEnd = endDate ? new Date(endDate.toString()) : undefined;
      
      const ledger = await service.getGeneralLedger(accountId as string, parsedStart, parsedEnd);
      sendResponse({ res, status: 200, message: 'General Ledger retrieved', data: ledger });
    } catch (error) {
      next(error);
    }
  }

  static async getTrialBalance(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new AccountingService(req.tenantId!);
      const trialBalance = await service.getTrialBalance();
      sendResponse({ res, status: 200, message: 'Trial Balance retrieved', data: trialBalance });
    } catch (error) {
      next(error);
    }
  }

  // --- Stubs for Phase 64 extensions ---

  static async getPeriods(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      sendResponse({ res, status: 200, message: 'Periods retrieved', data: [] });
    } catch (error) {
      next(error);
    }
  }

  static async closePeriod(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      sendResponse({ res, status: 200, message: 'Period closed successfully', data: {} });
    } catch (error) {
      next(error);
    }
  }

  static async getBudgets(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new AccountingService(req.tenantId!);
      const budgets = await service.getBudgets(req.query);
      sendResponse({ res, status: 200, message: 'Budgets retrieved', data: budgets });
    } catch (error) {
      next(error);
    }
  }

  static async createBudget(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new AccountingService(req.tenantId!);
      const budget = await service.createBudget(req.body);
      sendResponse({ res, status: 201, message: 'Budget created', data: budget });
    } catch (error) {
      next(error);
    }
  }

  static async updateBudget(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new AccountingService(req.tenantId!);
      const budget = await service.updateBudget(req.params.id, req.body);
      sendResponse({ res, status: 200, message: 'Budget updated', data: budget });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBudget(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const service = new AccountingService(req.tenantId!);
      const budget = await service.deleteBudget(req.params.id);
      sendResponse({ res, status: 200, message: 'Budget deleted', data: budget });
    } catch (error) {
      next(error);
    }
  }

  static async getTaxes(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      sendResponse({ res, status: 200, message: 'Taxes retrieved', data: [] });
    } catch (error) {
      next(error);
    }
  }

  static async importBankStatement(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      sendResponse({ res, status: 200, message: 'Bank statement imported successfully', data: {} });
    } catch (error) {
      next(error);
    }
  }
}
