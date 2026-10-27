import express from 'express';
import { protect, restrictTo } from '../../../core/middlewares/auth.middleware';
import { getSaasDashboardStats } from '../controllers/saasDashboard.controller';
import { getTenants, createTenantSchool, updateTenantStatus } from '../controllers/tenantManagement.controller';
import { getPlans, createPlan, updatePlan } from '../controllers/saasPlan.controller';
import { getSubscriptions, renewSubscription } from '../controllers/saasSubscription.controller';
import { getTenantDetail, updateTenant, suspendTenant, reactivateTenant, archiveTenant, updateOnboarding } from '../controllers/tenantExtended.controller';
import { getAllSubscriptions, getExpiringSoon, createSubscription, upgradePlan, cancelSubscription, getSubscriptionHistory, freezeSubscription, grantOneDayTrial, reactivateSubscription } from '../controllers/subscriptionLifecycle.controller';
import { getInvoices, getInvoiceById, generateInvoice, updateInvoiceStatus, cancelInvoice } from '../controllers/invoiceManagement.controller';
import { getPayments, recordPayment, getPaymentById } from '../controllers/paymentManagement.controller';
import { getCoupons, createCoupon, updateCoupon, validateCoupon, deleteCoupon } from '../controllers/couponManagement.controller';
import { getTickets, createTicket, updateTicket, getTicketById } from '../controllers/supportTicket.controller';
import { getFeatureFlags, createFeatureFlag, updateFeatureFlag, toggleFeatureFlag, deleteFeatureFlag } from '../controllers/featureFlag.controller';
import { getSettings, updateSetting, bulkUpdateSettings } from '../controllers/platformSetting.controller';
import { getAnnouncements, createAnnouncement, publishAnnouncement, updateAnnouncement, deleteAnnouncement } from '../controllers/platformAnnouncement.controller';
import { getAuditLogs } from '../controllers/platformAudit.controller';
import { getRevenueAnalytics, getUsageAnalytics } from '../controllers/revenueAnalytics.controller';
import { getSystemHealth } from '../controllers/systemHealth.controller';
import { getPlanFeatures, createPlanFeature, updatePlanFeature, getPlanModules, updatePlanModules } from '../controllers/planFeature.controller';

const router = express.Router();

// All routes in this module require SUPER_ADMIN role
router.use(protect);
router.use(restrictTo('SUPER_ADMIN'));

// ====================== DASHBOARD ======================
router.get('/dashboard', getSaasDashboardStats);

// ====================== TENANT MANAGEMENT ======================
router.get('/tenants', getTenants);
router.post('/tenants', createTenantSchool);
router.patch('/tenants/:id/status', updateTenantStatus);
router.get('/tenants/:id', getTenantDetail);
router.put('/tenants/:id', updateTenant);
router.post('/tenants/:id/suspend', suspendTenant);
router.post('/tenants/:id/reactivate', reactivateTenant);
router.post('/tenants/:id/archive', archiveTenant);
router.patch('/tenants/:id/onboarding', updateOnboarding);
router.get('/tenants/:tenantId/subscription-history', getSubscriptionHistory);

// ====================== SUBSCRIPTION PLANS ======================
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.patch('/plans/:id', updatePlan);

// ====================== PLAN FEATURES ======================
router.get('/plan-features', getPlanFeatures);
router.post('/plan-features', createPlanFeature);
// IMPORTANT: Static paths must come BEFORE parameterized :id routes
router.get('/plan-features/plan/:planId', getPlanModules);
router.put('/plan-features/plan/:planId/modules', updatePlanModules);
router.put('/plan-features/:id', updatePlanFeature);

// ====================== SUBSCRIPTIONS ======================
router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/all', getAllSubscriptions);
router.get('/subscriptions/expiring', getExpiringSoon);
router.post('/subscriptions', createSubscription);
router.post('/subscriptions/:tenantId/renew', renewSubscription);
router.post('/subscriptions/:id/upgrade', upgradePlan);
router.post('/subscriptions/:id/cancel', cancelSubscription);
router.post('/subscriptions/:id/freeze', freezeSubscription);
router.post('/subscriptions/:id/trial-1day', grantOneDayTrial);
router.post('/subscriptions/:id/reactivate', reactivateSubscription);

// ====================== INVOICES ======================
router.get('/invoices', getInvoices);
// IMPORTANT: /invoices/generate must come BEFORE /invoices/:id
router.post('/invoices/generate', generateInvoice);
router.get('/invoices/:id', getInvoiceById);
router.patch('/invoices/:id/status', updateInvoiceStatus);
router.delete('/invoices/:id', cancelInvoice);

// ====================== PAYMENTS ======================
router.get('/payments', getPayments);
router.post('/payments', recordPayment);
router.get('/payments/:id', getPaymentById);

// ====================== COUPONS ======================
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
// IMPORTANT: /coupons/validate must come BEFORE /coupons/:id
router.post('/coupons/validate', validateCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// ====================== SUPPORT TICKETS ======================
router.get('/tickets', getTickets);
router.post('/tickets', createTicket);
router.get('/tickets/:id', getTicketById);
router.put('/tickets/:id', updateTicket);

// ====================== FEATURE FLAGS ======================
router.get('/feature-flags', getFeatureFlags);
router.post('/feature-flags', createFeatureFlag);
router.put('/feature-flags/:id', updateFeatureFlag);
router.patch('/feature-flags/:id/toggle', toggleFeatureFlag);
router.delete('/feature-flags/:id', deleteFeatureFlag);

// ====================== PLATFORM SETTINGS ======================
router.get('/settings', getSettings);
router.post('/settings/bulk', bulkUpdateSettings);
router.patch('/settings/:key', updateSetting);

// ====================== ANNOUNCEMENTS ======================
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id', updateAnnouncement);
router.patch('/announcements/:id/publish', publishAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// ====================== AUDIT LOGS ======================
router.get('/audit-logs', getAuditLogs);

// ====================== ANALYTICS ======================
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/usage', getUsageAnalytics);

// ====================== SYSTEM ======================
router.get('/system/health', getSystemHealth);

export default router;
