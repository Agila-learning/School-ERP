import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tenant from '../../tenant/models/Tenant.model';
import School from '../../organization/models/School.model';
import Branch from '../../organization/models/Branch.model';
import User from '../../auth/models/User.model';
import TenantSubscription from '../../tenant/models/TenantSubscription.model';
import SubscriptionPlan from '../../tenant/models/SubscriptionPlan.model';
import PlatformAuditLog from '../models/PlatformAuditLog.model';
import SubscriptionHistory from '../models/SubscriptionHistory.model';

const auditLog = async (actorId: string, actorEmail: string, action: string, entityType: string, entityId: string, description: string, tenantId?: string, prev?: any, next?: any) => {
  try {
    await PlatformAuditLog.create({ actor: actorId, actorEmail, action, entityType, entityId, tenantId, description, previousValue: prev, newValue: next });
  } catch (e) { /* audit log failure must not break the main operation */ }
};

// @desc    Get single tenant with full detail
// @route   GET /api/v1/super-admin/tenants/:id
export const getTenantDetail = async (req: Request, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate('currentSubscriptionId');
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const schools = await School.find({ tenantId: tenant._id }).select('displayName code status email');
    const branches = await Branch.find({ schoolId: { $in: schools.map((s: any) => s._id) } }).select('name code status');
    const admins = await User.find({ tenantId: tenant._id, role: 'Admin' }).select('firstName lastName email status lastLoginAt createdAt').limit(20);
    const subscriptionHistory = await SubscriptionHistory.find({ tenantId: tenant._id }).populate('previousPlanId newPlanId', 'name').sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      data: { tenant, schools, branches, admins, subscriptionHistory }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch tenant detail' });
  }
};

// @desc    Update full tenant profile
// @route   PUT /api/v1/super-admin/tenants/:id
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const prev = tenant.toObject();
    const allowedFields = ['name', 'legalName', 'schoolType', 'phone', 'website', 'address', 'city', 'state', 'country', 'postalCode', 'logo', 'timezone', 'currency', 'primaryContactName', 'primaryContactEmail', 'primaryContactPhone', 'adminName', 'adminEmail', 'notes'];
    allowedFields.forEach(f => { if (req.body[f] !== undefined) (tenant as any)[f] = req.body[f]; });
    await tenant.save();

    const actor = (req as any).user;
    await auditLog(actor._id, actor.email, 'TENANT_UPDATED', 'Tenant', String(req.params.id), `Tenant "${tenant.name}" profile updated`, String(req.params.id), prev, tenant.toObject());

    res.json({ success: true, data: tenant, message: 'Tenant updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update tenant' });
  }
};

// @desc    Suspend a tenant
// @route   POST /api/v1/super-admin/tenants/:id/suspend
export const suspendTenant = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Suspension reason is required' });

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const actor = (req as any).user;
    const prev = tenant.status;

    tenant.status = 'SUSPENDED';
    tenant.suspensionReason = reason;
    tenant.suspendedBy = actor._id;
    tenant.suspendedAt = new Date();
    await tenant.save();

    await School.updateMany({ tenantId: tenant._id }, { status: 'SUSPENDED' });
    await auditLog(actor._id, actor.email, 'TENANT_SUSPENDED', 'Tenant', String(tenant._id), `Tenant "${tenant.name}" suspended. Reason: ${reason}`, String(tenant._id), prev, 'SUSPENDED');

    res.json({ success: true, message: `Tenant "${tenant.name}" has been suspended.`, data: tenant });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to suspend tenant' });
  }
};

// @desc    Reactivate a tenant
// @route   POST /api/v1/super-admin/tenants/:id/reactivate
export const reactivateTenant = async (req: Request, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const actor = (req as any).user;
    const prev = tenant.status;

    tenant.status = 'ACTIVE';
    tenant.suspensionReason = undefined;
    tenant.suspendedBy = undefined;
    tenant.suspendedAt = undefined;
    await tenant.save();

    await School.updateMany({ tenantId: tenant._id }, { status: 'ACTIVE' });
    await auditLog(actor._id, actor.email, 'TENANT_REACTIVATED', 'Tenant', String(tenant._id), `Tenant "${tenant.name}" reactivated`, String(tenant._id), prev, 'ACTIVE');

    res.json({ success: true, message: `Tenant "${tenant.name}" has been reactivated.`, data: tenant });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to reactivate tenant' });
  }
};

// @desc    Archive a tenant
// @route   POST /api/v1/super-admin/tenants/:id/archive
export const archiveTenant = async (req: Request, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const actor = (req as any).user;

    tenant.status = 'ARCHIVED';
    tenant.archivedAt = new Date();
    tenant.archivedBy = actor._id;
    await tenant.save();

    await auditLog(actor._id, actor.email, 'TENANT_ARCHIVED', 'Tenant', String(tenant._id), `Tenant "${tenant.name}" archived`, String(tenant._id));

    res.json({ success: true, message: `Tenant "${tenant.name}" archived.`, data: tenant });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to archive tenant' });
  }
};

// @desc    Update tenant onboarding progress
// @route   PATCH /api/v1/super-admin/tenants/:id/onboarding
export const updateOnboarding = async (req: Request, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const { step, completed, onboardingStatus } = req.body;

    if (step) {
      const progress = tenant.onboardingProgress || {};
      progress[step] = { completed: !!completed, updatedAt: new Date() };
      tenant.onboardingProgress = progress;
    }
    if (onboardingStatus) tenant.onboardingStatus = onboardingStatus;
    await tenant.save();

    res.json({ success: true, data: tenant, message: 'Onboarding updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update onboarding' });
  }
};
