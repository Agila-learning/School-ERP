import { Request, Response } from 'express';
import PlatformSetting from '../models/PlatformSetting.model';
import PlatformAuditLog from '../models/PlatformAuditLog.model';

const DEFAULT_SETTINGS = [
  { key: 'platform.name', value: 'School ERP SaaS', label: 'Platform Name', category: 'GENERAL', isSecret: false },
  { key: 'platform.supportEmail', value: 'support@schoolerp.com', label: 'Support Email', category: 'GENERAL', isSecret: false },
  { key: 'platform.defaultCurrency', value: 'INR', label: 'Default Currency', category: 'BILLING', isSecret: false },
  { key: 'platform.defaultTimezone', value: 'Asia/Kolkata', label: 'Default Timezone', category: 'GENERAL', isSecret: false },
  { key: 'platform.invoicePrefix', value: 'INV', label: 'Invoice Prefix', category: 'BILLING', isSecret: false },
  { key: 'platform.defaultTaxRate', value: 18, label: 'Default Tax Rate (%)', category: 'BILLING', isSecret: false },
  { key: 'platform.defaultTaxName', value: 'GST', label: 'Tax Name', category: 'BILLING', isSecret: false },
  { key: 'platform.trialDays', value: 14, label: 'Default Trial Days', category: 'SUBSCRIPTIONS', isSecret: false },
  { key: 'platform.paymentGateway', value: 'MANUAL', label: 'Payment Gateway', category: 'PAYMENT', isSecret: false },
];

// @desc    Get all settings
// @route   GET /api/v1/super-admin/settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    // Ensure defaults exist
    for (const def of DEFAULT_SETTINGS) {
      await PlatformSetting.findOneAndUpdate({ key: def.key }, { $setOnInsert: def }, { upsert: true, new: false });
    }
    // Return all, excluding secrets
    const settings = await PlatformSetting.find({ isSecret: false }).sort({ category: 1, key: 1 });
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch settings' });
  }
};

// @desc    Update setting value
// @route   PATCH /api/v1/super-admin/settings/:key
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { value } = req.body;
    const setting = await PlatformSetting.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedBy: (req as any).user?._id },
      { new: true }
    );
    if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });

    const actor = (req as any).user;
    await PlatformAuditLog.create({ actor: actor._id, actorEmail: actor.email, action: 'SETTINGS_UPDATED', entityType: 'PlatformSetting', entityId: setting.key, description: `Setting "${setting.label}" updated` });

    res.json({ success: true, data: setting, message: 'Setting updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update setting' });
  }
};

// @desc    Bulk update settings
// @route   POST /api/v1/super-admin/settings/bulk
export const bulkUpdateSettings = async (req: Request, res: Response) => {
  try {
    const { settings } = req.body; // Array of { key, value }
    const updates = await Promise.all(
      settings.map((s: { key: string; value: any }) =>
        PlatformSetting.findOneAndUpdate({ key: s.key }, { value: s.value, updatedBy: (req as any).user?._id }, { new: true })
      )
    );
    res.json({ success: true, data: updates, message: 'Settings updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update settings' });
  }
};
