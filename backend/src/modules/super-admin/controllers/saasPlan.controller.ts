import { Request, Response } from 'express';
import SubscriptionPlan from '../../tenant/models/SubscriptionPlan.model';

// @desc    Get all subscription plans
// @route   GET /api/v1/super-admin/plans
// @access  Private (Super Admin Only)
export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await SubscriptionPlan.find({ deletedAt: null }).sort({ price: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch plans.' });
  }
};

// @desc    Create subscription plan
// @route   POST /api/v1/super-admin/plans
// @access  Private (Super Admin Only)
export const createPlan = async (req: Request, res: Response) => {
  try {
    const { name, code, description, billingCycle, price, trialDays, maxStudents, maxStaff, maxBranches, enabledModules } = req.body;
    
    const existingPlan = await SubscriptionPlan.findOne({ code: code.toUpperCase() });
    if (existingPlan) {
      return res.status(400).json({ success: false, message: 'Plan code already exists.' });
    }

    const plan = await SubscriptionPlan.create({
      name,
      code: code.toUpperCase(),
      description,
      billingCycle,
      price,
      trialDays: trialDays !== undefined ? trialDays : 1,
      maxStudents,
      maxStaff,
      maxBranches,
      enabledModules
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create plan.' });
  }
};

// @desc    Update subscription plan
// @route   PATCH /api/v1/super-admin/plans/:id
// @access  Private (Super Admin Only)
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update plan.' });
  }
};
