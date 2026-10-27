import { Request, Response } from 'express';
import SaasCoupon from '../models/Coupon.model';

// @desc    Get all coupons
// @route   GET /api/v1/super-admin/coupons
export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await SaasCoupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch coupons' });
  }
};

// @desc    Create coupon
// @route   POST /api/v1/super-admin/coupons
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await SaasCoupon.create({ ...req.body, createdBy: (req as any).user?._id });
    res.status(201).json({ success: true, data: coupon, message: 'Coupon created.' });
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Coupon code already exists.' });
    res.status(500).json({ success: false, message: err.message || 'Failed to create coupon' });
  }
};

// @desc    Update coupon
// @route   PUT /api/v1/super-admin/coupons/:id
export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await SaasCoupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update coupon' });
  }
};

// @desc    Validate a coupon code
// @route   POST /api/v1/super-admin/coupons/validate
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, planId, amount } = req.body;
    const coupon = await SaasCoupon.findOne({ code: code?.toUpperCase(), status: 'ACTIVE' });

    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    if (coupon.endDate && coupon.endDate < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired.' });
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
    if (coupon.minimumAmount && amount < coupon.minimumAmount) return res.status(400).json({ success: false, message: `Minimum amount of ${coupon.minimumAmount} required.` });

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((amount * coupon.discountValue) / 100);
      if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
    } else {
      discount = Math.min(coupon.discountValue, amount);
    }

    res.json({ success: true, data: { coupon, discountAmount: discount, finalAmount: amount - discount } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to validate coupon' });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/v1/super-admin/coupons/:id
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    await SaasCoupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete coupon' });
  }
};
