import { Request, Response } from 'express';
import PlatformAuditLog from '../models/PlatformAuditLog.model';

// @desc    Get audit logs
// @route   GET /api/v1/super-admin/audit-logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const query: any = {};
    if (req.query.action) query.action = { $regex: req.query.action as string, $options: 'i' };
    if (req.query.entityType) query.entityType = req.query.entityType;
    if (req.query.tenantId) query.tenantId = req.query.tenantId;
    if (req.query.actor) query.actor = req.query.actor;

    const [logs, total] = await Promise.all([
      PlatformAuditLog.find(query)
        .populate('actor', 'firstName lastName email')
        .populate('tenantId', 'name code')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      PlatformAuditLog.countDocuments(query)
    ]);

    res.json({ success: true, data: logs, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch audit logs' });
  }
};
