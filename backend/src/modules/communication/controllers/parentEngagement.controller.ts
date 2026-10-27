import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { EngagementService } from '../services/Engagement.service';
import { ChatService } from '../services/Chat.service';
import { sendResponse } from '../../../core/utils/response.util';
import { ParentRequest } from '../../../core/middlewares/parentAuth.middleware';
import Complaint from '../models/Complaint.model';
import Conversation from '../models/Conversation.model';

export const submitComplaint = async (req: ParentRequest, res: Response, next: NextFunction) => {
  try {
    const complaint = await EngagementService.createComplaint(req.tenantId!, req.body, req.user?._id);
    sendResponse({ res, status: 201, message: 'Complaint submitted successfully', data: complaint });
  } catch (error) {
    next(error);
  }
};

export const getMyComplaints = async (req: ParentRequest, res: Response, next: NextFunction) => {
  try {
    const complaints = await Complaint.find({ tenantId: req.tenantId, submittedBy: req.user?._id }).sort({ createdAt: -1 });
    sendResponse({ res, message: 'Complaints fetched', data: complaints });
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req: ParentRequest, res: Response, next: NextFunction) => {
  try {
    const convos = await Conversation.find({ tenantId: req.tenantId, 'participants.userId': req.user?._id })
      .populate('participants.userId', 'firstName lastName role photoUrl')
      .sort({ lastMessageAt: -1 });
    sendResponse({ res, message: 'Conversations fetched', data: convos });
  } catch (error) {
    next(error);
  }
};

export const startConversation = async (req: ParentRequest, res: Response, next: NextFunction) => {
  try {
    const { targetId, targetType = 'Staff', relatedStudentId } = req.body;
    let actualTargetId = targetId;

    if (mongoose.Types.ObjectId.isValid(targetId)) {
      const Employee = (mongoose.models['Employee'] || (await import('../../hr/models/Employee.model')).default) as any;
      const emp = await Employee.findById(targetId);
      if (emp && emp.userId) {
        actualTargetId = emp.userId.toString();
      }
    }

    const initiatorId = ((req.user as any)?._id || (req.user as any)?.id || req.parent?._id)?.toString();

    const convo = await ChatService.startOrGetConversation(
      req.tenantId as string,
      initiatorId,
      'Parent',
      actualTargetId,
      targetType,
      relatedStudentId
    );
    sendResponse({ res, status: 201, message: 'Conversation started/retrieved', data: convo });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: ParentRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const { content, attachments } = req.body;
    const msg = await ChatService.sendMessage(req.tenantId!, conversationId as string, req.user?._id, content, attachments);
    sendResponse({ res, status: 201, message: 'Message sent', data: msg });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: ParentRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const messages = await ChatService.getMessages(req.tenantId!, conversationId as string, req.user?._id);
    sendResponse({ res, message: 'Messages fetched', data: messages });
  } catch (error) {
    next(error);
  }
};
