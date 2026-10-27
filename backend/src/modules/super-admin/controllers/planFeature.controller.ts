import { Request, Response } from 'express';
import PlanFeature from '../models/PlanFeature.model';
import SubscriptionPlan from '../../tenant/models/SubscriptionPlan.model';

// @desc    Get all platform features
// @route   GET /api/v1/super-admin/plan-features
export const getPlanFeatures = async (req: Request, res: Response) => {
  try {
    const features = await PlanFeature.find({ status: { $ne: 'DEPRECATED' } }).sort({ category: 1, sortOrder: 1, name: 1 });
    res.json({ success: true, data: features });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch features' });
  }
};

// @desc    Create feature
// @route   POST /api/v1/super-admin/plan-features
export const createPlanFeature = async (req: Request, res: Response) => {
  try {
    const feature = await PlanFeature.create(req.body);
    res.status(201).json({ success: true, data: feature, message: 'Feature created.' });
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Feature code already exists.' });
    res.status(500).json({ success: false, message: err.message || 'Failed to create feature' });
  }
};

// @desc    Update feature
// @route   PUT /api/v1/super-admin/plan-features/:id
export const updatePlanFeature = async (req: Request, res: Response) => {
  try {
    const feature = await PlanFeature.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!feature) return res.status(404).json({ success: false, message: 'Feature not found' });
    res.json({ success: true, data: feature });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update feature' });
  }
};

// @desc    Get plan with its enabled modules
// @route   GET /api/v1/super-admin/plan-features/plan/:planId
export const getPlanModules = async (req: Request, res: Response) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    const allFeatures = await PlanFeature.find({ status: 'ACTIVE' }).sort({ category: 1, name: 1 });
    res.json({ success: true, data: { plan, allFeatures, enabledModules: plan.enabledModules } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch plan modules' });
  }
};

// @desc    Update plan modules
// @route   PUT /api/v1/super-admin/plan-features/plan/:planId/modules
export const updatePlanModules = async (req: Request, res: Response) => {
  try {
    const { enabledModules } = req.body;
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.planId, { enabledModules }, { new: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, data: plan, message: 'Plan modules updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update plan modules' });
  }
};
