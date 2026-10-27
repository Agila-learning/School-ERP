import { Request, Response } from 'express';
import FeatureFlag from '../models/FeatureFlag.model';
import PlatformAuditLog from '../models/PlatformAuditLog.model';

// @desc    Get all feature flags
// @route   GET /api/v1/super-admin/feature-flags
export const getFeatureFlags = async (req: Request, res: Response) => {
  try {
    const flags = await FeatureFlag.find().sort({ key: 1 });
    res.json({ success: true, data: flags });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch feature flags' });
  }
};

// @desc    Create feature flag
// @route   POST /api/v1/super-admin/feature-flags
export const createFeatureFlag = async (req: Request, res: Response) => {
  try {
    const flag = await FeatureFlag.create({ ...req.body, updatedBy: (req as any).user?._id });
    res.status(201).json({ success: true, data: flag, message: 'Feature flag created.' });
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Feature flag key already exists.' });
    res.status(500).json({ success: false, message: err.message || 'Failed to create feature flag' });
  }
};

// @desc    Update feature flag
// @route   PUT /api/v1/super-admin/feature-flags/:id
export const updateFeatureFlag = async (req: Request, res: Response) => {
  try {
    const prev = await FeatureFlag.findById(req.params.id);
    const flag = await FeatureFlag.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: (req as any).user?._id }, { new: true });
    if (!flag) return res.status(404).json({ success: false, message: 'Feature flag not found' });

    const actor = (req as any).user;
    await PlatformAuditLog.create({ actor: actor._id, actorEmail: actor.email, action: 'FEATURE_FLAG_UPDATED', entityType: 'FeatureFlag', entityId: String(flag._id), description: `Feature flag "${flag.key}" updated`, previousValue: prev?.enabled, newValue: flag.enabled });

    res.json({ success: true, data: flag, message: 'Feature flag updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update feature flag' });
  }
};

// @desc    Toggle feature flag
// @route   PATCH /api/v1/super-admin/feature-flags/:id/toggle
export const toggleFeatureFlag = async (req: Request, res: Response) => {
  try {
    const flag = await FeatureFlag.findById(req.params.id);
    if (!flag) return res.status(404).json({ success: false, message: 'Feature flag not found' });
    flag.enabled = !flag.enabled;
    flag.updatedBy = (req as any).user?._id;
    await flag.save();
    res.json({ success: true, data: flag, message: `Feature flag "${flag.key}" ${flag.enabled ? 'enabled' : 'disabled'}.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to toggle feature flag' });
  }
};

// @desc    Delete feature flag
// @route   DELETE /api/v1/super-admin/feature-flags/:id
export const deleteFeatureFlag = async (req: Request, res: Response) => {
  try {
    await FeatureFlag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Feature flag deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete feature flag' });
  }
};
