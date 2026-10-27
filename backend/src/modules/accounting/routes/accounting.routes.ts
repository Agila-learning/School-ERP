import { Router } from 'express';
import { AccountingController } from '../controllers/accounting.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = Router();

router.use(tenantMiddleware, protect);

// Chart of Accounts
router.get('/accounts', requirePermission('accounting.view'), AccountingController.getChartOfAccounts);
router.post('/accounts', requirePermission('accounting.accounts.manage'), AccountingController.createAccount);
router.put('/accounts/:id', requirePermission('accounting.accounts.manage'), AccountingController.updateAccount);
router.delete('/accounts/:id', requirePermission('accounting.accounts.manage'), AccountingController.deleteAccount);

// Journal Entries
router.post('/journals/post', requirePermission('accounting.journal.post'), AccountingController.postJournal);

// Reports
router.get('/ledger/:accountId', requirePermission('accounting.ledger.view'), AccountingController.getGeneralLedger);
router.get('/trial-balance', requirePermission('accounting.trial_balance.view'), AccountingController.getTrialBalance);

// Periods
router.get('/periods', requirePermission('accounting.view'), AccountingController.getPeriods);
router.post('/periods/close', requirePermission('accounting.period.manage'), AccountingController.closePeriod);

// Budgets
router.get('/budgets', requirePermission('accounting.view'), AccountingController.getBudgets);
router.post('/budgets', requirePermission('accounting.budget.manage'), AccountingController.createBudget);
router.put('/budgets/:id', requirePermission('accounting.budget.manage'), AccountingController.updateBudget);
router.delete('/budgets/:id', requirePermission('accounting.budget.manage'), AccountingController.deleteBudget);

// Taxes
router.get('/taxes', requirePermission('accounting.view'), AccountingController.getTaxes);

// Bank Reconciliation
router.post('/bank/import', requirePermission('accounting.reconciliation.manage'), AccountingController.importBankStatement);

export default router;
