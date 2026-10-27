import AuditLog from '../models/AuditLog.model';
import { logger } from '../../../core/logger/logger';

export class AuditService {
  /**
   * Log an action in the Audit Log asynchronously
   */
  static log(data: {
    tenantId: string;
    action: string;
    entityType: string;
    entityId: string;
    performedBy: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
  }) {
    // Fire and forget, we don't want to block the main request thread
    AuditLog.create(data).catch((err: any) => {
      logger.error({ err, auditData: data }, 'Failed to write audit log');
    });
  }

  /**
   * Fetch audit logs with pagination and filters
   */
  async getLogs(
    tenantId: string,
    query: {
      page?: number;
      limit?: number;
      action?: string;
      entityType?: string;
      performedBy?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const { page = 1, limit = 50, action, entityType, performedBy, startDate, endDate } = query;
    const filter: any = { tenantId };

    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    if (performedBy) filter.performedBy = performedBy;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('performedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
}
