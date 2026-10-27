import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { sendResponse } from '../../../core/utils/response.util';
import { AdminAnalyticsService } from '../services/adminAnalytics.service';

// @desc    Admin Dashboard Summary (real data aggregation)
// @route   GET /api/v1/admin/dashboard/summary
// @access  Private (Admin)
export const getDashboardSummary = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const academicYearId = req.headers['x-academic-year-id'] as string | undefined;
    const data = await AdminAnalyticsService.getDashboardSummary(tenantId, academicYearId);

    sendResponse({
      res,
      message: 'Dashboard summary fetched',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Attendance summary
// @route   GET /api/v1/admin/dashboard/attendance
export const getAttendanceSummary = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const academicYearId = req.headers['x-academic-year-id'] as string | undefined;
    const data = await AdminAnalyticsService.getAttendanceSummary(tenantId, academicYearId);

    sendResponse({
      res,
      message: 'Attendance summary fetched',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fee summary
// @route   GET /api/v1/admin/dashboard/fees
export const getFeeSummary = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const academicYearId = req.headers['x-academic-year-id'] as string | undefined;
    const data = await AdminAnalyticsService.getFeeSummary(tenantId, academicYearId);

    sendResponse({
      res,
      message: 'Fee summary fetched',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upcoming events
// @route   GET /api/v1/admin/dashboard/events
export const getUpcomingEvents = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const data = await AdminAnalyticsService.getUpcomingEvents(tenantId);
    sendResponse({ res, message: 'Events fetched', data });
  } catch (error) {
    next(error);
  }
};

// @desc    Recent activities from audit log
// @route   GET /api/v1/admin/dashboard/activities
export const getRecentActivities = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const data = await AdminAnalyticsService.getRecentActivities(tenantId);
    sendResponse({ res, message: 'Activities fetched', data });
  } catch (error) {
    next(error);
  }
};

// @desc    Action items
// @route   GET /api/v1/admin/dashboard/action-items
export const getActionItems = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    sendResponse({ res, message: 'Action items fetched', data: [] });
  } catch (error) {
    next(error);
  }
};
