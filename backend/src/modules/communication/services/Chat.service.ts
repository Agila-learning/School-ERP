import mongoose from 'mongoose';
import Conversation from '../models/Conversation.model';
import Message from '../models/Message.model';
import User from '../../auth/models/User.model';

export class ChatService {
  static async startOrGetConversation(
    tenantId: string,
    initiatorId: string,
    initiatorType: string,
    targetId: string,
    targetType: string,
    relatedStudentId?: string
  ) {
    const normUserType = (t: string) => {
      const upper = (t || '').toUpperCase();
      if (upper.includes('STUDENT')) return 'STUDENT';
      if (upper.includes('PARENT')) return 'PARENT';
      if (upper.includes('ADMIN')) return 'ADMIN';
      return 'EMPLOYEE';
    };

    // Find if conversation exists between these 2 users
    let conversation = await Conversation.findOne({
      tenantId,
      type: 'ONE_TO_ONE',
      'participants.userId': { $all: [initiatorId, targetId] }
    }).catch(() => null);

    if (!conversation) {
      // Find names for conversation title
      const [u1, u2] = await Promise.all([
        User.findById(initiatorId).catch(() => null),
        User.findById(targetId).catch(() => null)
      ]);

      const title = u2 ? `${u2.firstName} ${u2.lastName || ''}`.trim() : 'Institutional Direct Chat';

      conversation = await Conversation.create({
        tenantId,
        type: 'ONE_TO_ONE',
        title,
        participants: [
          { userId: initiatorId, userType: normUserType(initiatorType) },
          { userId: targetId, userType: normUserType(targetType) }
        ],
        relatedStudentId: relatedStudentId && mongoose.isValidObjectId(relatedStudentId) ? new mongoose.Types.ObjectId(relatedStudentId) : undefined,
        lastMessageAt: new Date()
      });
    }

    return conversation;
  }

  static async sendMessage(
    tenantId: string,
    conversationId: string,
    senderId: string,
    content: string,
    attachments?: string[]
  ) {
    let conversation = await Conversation.findOne({ _id: conversationId, tenantId }).catch(() => null);
    if (!conversation && mongoose.isValidObjectId(conversationId)) {
      conversation = await Conversation.findById(conversationId).catch(() => null);
    }

    if (!conversation) {
      conversation = await Conversation.create({
        tenantId,
        type: 'ONE_TO_ONE',
        participants: [{ userId: senderId, userType: 'EMPLOYEE' }],
        lastMessageAt: new Date()
      }).catch(() => null);
    }

    const message = await Message.create({
      tenantId,
      conversationId: conversation?._id || conversationId,
      senderId,
      content,
      attachments: attachments || []
    });

    if (conversation) {
      conversation.lastMessageAt = new Date();
      await conversation.save().catch(() => {});
    }

    return message;
  }

  static async getMessages(
    tenantId: string,
    conversationId: string,
    userId: string,
    limit: number = 50,
    skip: number = 0
  ) {
    try {
      const messages = await Message.find({ tenantId, conversationId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'firstName lastName photoUrl role')
        .lean();
      return messages || [];
    } catch (err) {
      return [];
    }
  }
}
