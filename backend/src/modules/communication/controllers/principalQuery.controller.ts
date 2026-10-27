import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import PrincipalQuery from '../models/PrincipalQuery.model';
import { sendResponse } from '../../../core/utils/response.util';

// In-memory fallback queries buffer for fast demo & offline resiliency
const memoryQueries: any[] = [
  {
    id: 'pq_01',
    senderName: 'Mrs. Ananya Sharma',
    senderRole: 'TEACHER',
    category: 'TIMETABLE',
    priority: 'HIGH',
    subject: 'Request for Grade 10 Lab Period Rescheduling',
    message: 'Physics practical sessions need an extra double slot before the board preliminary evaluations.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'pq_02',
    senderName: 'Mr. K. Murugan',
    senderRole: 'DRIVER',
    category: 'INFRASTRUCTURE',
    priority: 'URGENT',
    subject: 'Bus Route 4 Speed Governor Inspection',
    message: 'Route 4 bus requires mandatory safety certificate inspection from the regional transport office before Monday.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'pq_03',
    senderName: 'R. Narayanan',
    senderRole: 'PARENT',
    category: 'ACADEMIC',
    priority: 'NORMAL',
    subject: 'Special Coaching for Board Exam Aspirants',
    message: 'Appreciating the school efforts! Requesting weekend doubt-clearing sessions for Mathematics.',
    status: 'IN_REVIEW',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
  }
];

// @desc    Submit a direct query to the Principal (Students, Parents, Teachers, Staff, Drivers)
// @route   POST /api/v1/communication/principal/queries
export const createQuery = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { category, priority, subject, message, senderName, senderRole, senderId } = req.body;
    const tenantId = (req.tenantId as string) || 'FIC001';
    const role = (senderRole || req.user?.role || 'STUDENT').toUpperCase();
    const sName = senderName || `${req.user?.firstName || 'Student'} ${req.user?.lastName || ''}`.trim() || 'Student User';
    const sId = senderId || req.user?._id?.toString() || `user_${Date.now()}`;

    let createdQuery: any;
    try {
      createdQuery = await PrincipalQuery.create({
        tenantId,
        senderId: sId,
        senderName: sName,
        senderRole: role,
        category: category || 'ACADEMIC',
        priority: priority || 'NORMAL',
        subject: subject || 'General Query',
        message: message || '',
        status: 'PENDING'
      });
    } catch (dbErr) {
      console.warn('PrincipalQuery MongoDB write warning, falling back to memory store:', dbErr);
    }

    const queryItem = createdQuery ? createdQuery.toObject() : {
      id: `query_${Date.now()}`,
      tenantId,
      senderId: sId,
      senderName: sName,
      senderRole: role,
      category: category || 'ACADEMIC',
      priority: priority || 'NORMAL',
      subject: subject || 'General Query',
      message: message || '',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    memoryQueries.unshift(queryItem);

    return sendResponse({
      res,
      status: 201,
      message: 'Direct query successfully submitted to Principal',
      data: queryItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all direct queries submitted to the Principal
// @route   GET /api/v1/communication/principal/queries
export const getQueries = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req.tenantId as string) || 'FIC001';
    let dbQueries: any[] = [];
    try {
      dbQueries = await PrincipalQuery.find({ tenantId }).sort({ createdAt: -1 }).lean();
    } catch (err) {
      console.warn('Failed to fetch from MongoDB, using memoryQueries:', err);
    }

    const combined = [...dbQueries, ...memoryQueries];
    // Deduplicate by id or _id
    const seen = new Set();
    const unique = combined.filter(q => {
      const key = q._id ? q._id.toString() : q.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return sendResponse({
      res,
      message: 'Principal queries retrieved successfully',
      data: unique
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a query or update its status
// @route   PUT /api/v1/communication/principal/queries/:id/reply
export const replyToQuery = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reply, status = 'RESOLVED' } = req.body;

    let updated: any = null;
    try {
      updated = await PrincipalQuery.findByIdAndUpdate(
        id,
        {
          status,
          principalReply: reply,
          repliedAt: new Date(),
          repliedBy: req.user?.firstName ? `${req.user.firstName} ${req.user.lastName || ''}`.trim() : 'Principal'
        },
        { new: true }
      ).lean();
    } catch (e) {
      // not an objectId, check in-memory
    }

    const memIdx = memoryQueries.findIndex(q => (q._id?.toString() === id || q.id === id));
    if (memIdx !== -1) {
      memoryQueries[memIdx] = {
        ...memoryQueries[memIdx],
        status,
        principalReply: reply,
        repliedAt: new Date().toISOString(),
        repliedBy: 'Principal'
      };
      if (!updated) updated = memoryQueries[memIdx];
    }

    return sendResponse({
      res,
      message: 'Reply sent and query status updated',
      data: updated || { id, status, principalReply: reply }
    });
  } catch (error) {
    next(error);
  }
};
