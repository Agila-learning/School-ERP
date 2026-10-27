import { Response, NextFunction } from 'express';
import { EngagementService } from '../services/Engagement.service';
import { ChatService } from '../services/Chat.service';
import { sendResponse } from '../../../core/utils/response.util';
import { StaffRequest } from '../../../core/middlewares/staffAuth.middleware';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import Complaint from '../models/Complaint.model';
import Conversation from '../models/Conversation.model';

export const getAssignedComplaints = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const complaints = await Complaint.find({ tenantId: req.tenantId, assignedTo: req.staff._id }).sort({ createdAt: -1 });
    sendResponse({ res, message: 'Complaints fetched', data: complaints });
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const { resolution } = req.body;
    const complaint = await EngagementService.resolveComplaint(req.tenantId!, req.params.id as string, resolution, req.user?._id);
    sendResponse({ res, message: 'Complaint resolved', data: complaint });
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const convos = await Conversation.find({ tenantId: req.tenantId, 'participants.userId': req.user?._id })
      .sort({ lastMessageAt: -1 })
      .lean();

    const userIds = new Set<string>();
    convos.forEach((c: any) => {
      c.participants?.forEach((p: any) => {
        if (p.userId) userIds.add(p.userId.toString());
      });
    });

    const User = (await import('../../auth/models/User.model')).default;
    const users = await User.find({ _id: { $in: Array.from(userIds) } }, 'firstName lastName role').lean();
    const userMap = new Map<string, any>(users.map((u: any) => [u._id.toString(), u]));

    const enriched = convos.map((c: any) => {
      const parts = c.participants?.map((p: any) => {
        const u = userMap.get(p.userId?.toString());
        const fName = u?.firstName || '';
        const lName = u?.lastName || '';
        const fullName = `${fName} ${lName}`.trim();
        return {
          _id: p.userId,
          userId: p.userId,
          firstName: fName,
          lastName: lName,
          name: fullName || c.title || 'Staff / Scholar',
          role: u?.role || p.userType || 'Staff',
          userType: p.userType || 'EMPLOYEE'
        };
      }) || [];

      const otherPart = parts.find((p: any) => p.userId?.toString() !== req.user?._id?.toString()) || parts[0];
      const otherName = otherPart?.name || 'Channel';

      return {
        ...c,
        title: (c.title && !c.title.includes('undefined')) ? c.title : otherName,
        participants: parts
      };
    });

    sendResponse({ res, message: 'Conversations fetched', data: enriched });
  } catch (error) {
    next(error);
  }
};

export const startConversation = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const { targetId, targetType, relatedStudentId } = req.body;
    const convo = await ChatService.startOrGetConversation(
      req.tenantId as string,
      req.user?._id as string,
      'Staff',
      targetId,
      targetType,
      relatedStudentId
    );
    sendResponse({ res, status: 201, message: 'Conversation started/retrieved', data: convo });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const { content, attachments } = req.body;
    const msg = await ChatService.sendMessage(req.tenantId!, conversationId as string, req.user?._id, content, attachments);
    sendResponse({ res, status: 201, message: 'Message sent', data: msg });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: StaffRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const messages = await ChatService.getMessages(req.tenantId!, conversationId as string, req.user?._id);
    sendResponse({ res, message: 'Messages fetched', data: messages });
  } catch (error) {
    next(error);
  }
};
