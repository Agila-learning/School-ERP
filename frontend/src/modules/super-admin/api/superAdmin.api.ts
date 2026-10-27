import api from '../../../core/api/axios';

const BASE = '/super-admin';

// Dashboard
export const getSaasDashboard = () => api.get(`${BASE}/dashboard`);
export const getRevenueAnalytics = () => api.get(`${BASE}/analytics/revenue`);
export const getUsageAnalytics = () => api.get(`${BASE}/analytics/usage`);

// Tenants
export const getTenants = (params?: any) => api.get(`${BASE}/tenants`, { params });
export const getTenantDetail = (id: string) => api.get(`${BASE}/tenants/${id}`);
export const createTenant = (data: any) => api.post(`${BASE}/tenants`, data);
export const updateTenant = (id: string, data: any) => api.put(`${BASE}/tenants/${id}`, data);
export const suspendTenant = (id: string, reason: string) => api.post(`${BASE}/tenants/${id}/suspend`, { reason });
export const reactivateTenant = (id: string) => api.post(`${BASE}/tenants/${id}/reactivate`);
export const archiveTenant = (id: string) => api.post(`${BASE}/tenants/${id}/archive`);
export const updateOnboarding = (id: string, data: any) => api.patch(`${BASE}/tenants/${id}/onboarding`, data);

// Plans
export const getPlans = () => api.get(`${BASE}/plans`);
export const createPlan = (data: any) => api.post(`${BASE}/plans`, data);
export const updatePlan = (id: string, data: any) => api.patch(`${BASE}/plans/${id}`, data);

// Plan Features
export const getPlanFeatures = () => api.get(`${BASE}/plan-features`);
export const createPlanFeature = (data: any) => api.post(`${BASE}/plan-features`, data);
export const updatePlanFeature = (id: string, data: any) => api.put(`${BASE}/plan-features/${id}`, data);
export const getPlanModules = (planId: string) => api.get(`${BASE}/plan-features/plan/${planId}`);
export const updatePlanModules = (planId: string, enabledModules: string[]) => api.put(`${BASE}/plan-features/plan/${planId}/modules`, { enabledModules });

// Subscriptions
export const getAllSubscriptions = (params?: any) => api.get(`${BASE}/subscriptions/all`, { params });
export const getExpiringSoon = (days?: number) => api.get(`${BASE}/subscriptions/expiring`, { params: { days } });
export const createSubscription = (data: any) => api.post(`${BASE}/subscriptions`, data);
export const upgradePlan = (subscriptionId: string, data: any) => api.post(`${BASE}/subscriptions/${subscriptionId}/upgrade`, data);
export const cancelSubscription = (subscriptionId: string, reason: string) => api.post(`${BASE}/subscriptions/${subscriptionId}/cancel`, { reason });
export const getSubscriptionHistory = (tenantId: string) => api.get(`${BASE}/tenants/${tenantId}/subscription-history`);
export const freezeSubscription = (subscriptionId: string) => api.post(`${BASE}/subscriptions/${subscriptionId}/freeze`);
export const grantOneDayTrial = (subscriptionId: string) => api.post(`${BASE}/subscriptions/${subscriptionId}/trial-1day`);
export const reactivateSubscription = (subscriptionId: string) => api.post(`${BASE}/subscriptions/${subscriptionId}/reactivate`);

// Invoices
export const getInvoices = (params?: any) => api.get(`${BASE}/invoices`, { params });
export const getInvoiceById = (id: string) => api.get(`${BASE}/invoices/${id}`);
export const generateInvoice = (data: any) => api.post(`${BASE}/invoices/generate`, data);
export const updateInvoiceStatus = (id: string, data: any) => api.patch(`${BASE}/invoices/${id}/status`, data);
export const cancelInvoice = (id: string) => api.delete(`${BASE}/invoices/${id}`);

// Payments
export const getPayments = (params?: any) => api.get(`${BASE}/payments`, { params });
export const recordPayment = (data: any) => api.post(`${BASE}/payments`, data);
export const getPaymentById = (id: string) => api.get(`${BASE}/payments/${id}`);

// Coupons
export const getCoupons = () => api.get(`${BASE}/coupons`);
export const createCoupon = (data: any) => api.post(`${BASE}/coupons`, data);
export const updateCoupon = (id: string, data: any) => api.put(`${BASE}/coupons/${id}`, data);
export const deleteCoupon = (id: string) => api.delete(`${BASE}/coupons/${id}`);
export const validateCoupon = (data: any) => api.post(`${BASE}/coupons/validate`, data);

// Support Tickets
export const getTickets = (params?: any) => api.get(`${BASE}/tickets`, { params });
export const getTicketById = (id: string) => api.get(`${BASE}/tickets/${id}`);
export const createTicket = (data: any) => api.post(`${BASE}/tickets`, data);
export const updateTicket = (id: string, data: any) => api.put(`${BASE}/tickets/${id}`, data);

// Feature Flags
export const getFeatureFlags = () => api.get(`${BASE}/feature-flags`);
export const createFeatureFlag = (data: any) => api.post(`${BASE}/feature-flags`, data);
export const updateFeatureFlag = (id: string, data: any) => api.put(`${BASE}/feature-flags/${id}`, data);
export const toggleFeatureFlag = (id: string) => api.patch(`${BASE}/feature-flags/${id}/toggle`);
export const deleteFeatureFlag = (id: string) => api.delete(`${BASE}/feature-flags/${id}`);

// Settings
export const getSettings = () => api.get(`${BASE}/settings`);
export const updateSetting = (key: string, value: any) => api.patch(`${BASE}/settings/${key}`, { value });
export const bulkUpdateSettings = (settings: Array<{key: string, value: any}>) => api.post(`${BASE}/settings/bulk`, { settings });

// Announcements
export const getAnnouncements = (params?: any) => api.get(`${BASE}/announcements`, { params });
export const createAnnouncement = (data: any) => api.post(`${BASE}/announcements`, data);
export const updateAnnouncement = (id: string, data: any) => api.put(`${BASE}/announcements/${id}`, data);
export const publishAnnouncement = (id: string) => api.patch(`${BASE}/announcements/${id}/publish`);
export const deleteAnnouncement = (id: string) => api.delete(`${BASE}/announcements/${id}`);

// Audit Logs
export const getAuditLogs = (params?: any) => api.get(`${BASE}/audit-logs`, { params });

// System Health
export const getSystemHealth = () => api.get(`${BASE}/system/health`);
