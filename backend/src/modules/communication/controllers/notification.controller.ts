import { Request, Response, NextFunction } from 'express';
import CommunicationDelivery from '../models/CommunicationDelivery.model';
import Communication from '../models/Communication.model';
import { sendResponse } from '../../../core/utils/response.util';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import mongoose from 'mongoose';

export const getMyNotifications = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: any = {
      tenantId: req.tenantId,
      recipientId: req.user?._id,
      channel: 'IN_APP',
      isArchived: false,
    };

    if (req.query.status === 'UNREAD') {
      query.status = { $in: ['QUEUED', 'PROCESSING', 'SENT', 'DELIVERED'] }; // Basically not 'READ' or 'FAILED'
    } else if (req.query.status === 'READ') {
      query.status = 'READ';
    }

    const notifications = await CommunicationDelivery.find(query)
      .populate('communicationId', 'title content type priority scheduledFor publishedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CommunicationDelivery.countDocuments(query);

    sendResponse({ 
      res, 
      message: 'Notifications fetched', 
      data: {
        notifications,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const count = await CommunicationDelivery.countDocuments({
      tenantId: req.tenantId,
      recipientId: req.user?._id,
      channel: 'IN_APP',
      status: { $ne: 'READ' },
      isArchived: false
    });

    sendResponse({ res, message: 'Unread count fetched', data: { count } });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const notification = await CommunicationDelivery.findOneAndUpdate(
      { _id: id, recipientId: req.user?._id, tenantId: req.tenantId },
      { status: 'READ', readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    sendResponse({ res, message: 'Notification marked as read', data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    await CommunicationDelivery.updateMany(
      { 
        recipientId: req.user?._id, 
        tenantId: req.tenantId,
        channel: 'IN_APP',
        status: { $ne: 'READ' },
        isArchived: false
      },
      { 
        $set: { status: 'READ', readAt: new Date() } 
      }
    );

    sendResponse({ res, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const archiveNotification = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const notification = await CommunicationDelivery.findOneAndUpdate(
      { _id: id, recipientId: req.user?._id, tenantId: req.tenantId },
      { isArchived: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    sendResponse({ res, message: 'Notification archived', data: notification });
  } catch (error) {
    next(error);
  }
};
