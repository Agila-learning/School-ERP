import { Router } from 'express';
import * as adminCtrl from './controllers/adminCommunication.controller';
import * as parentCtrl from './controllers/parentEngagement.controller';
import * as staffCtrl from './controllers/staffCommunication.controller';
import { protect as requireAuth } from '../../core/middlewares/auth.middleware';
import { parentAuthMiddleware as authenticateParent } from '../../core/middlewares/parentAuth.middleware';
import { staffAuthMiddleware as authenticateStaff } from '../../core/middlewares/staffAuth.middleware';
import * as notificationCtrl from './controllers/notification.controller';
import * as meetingCtrl from './controllers/meeting.controller';
import * as principalQueryCtrl from './controllers/principalQuery.controller';

const router = Router();

// --- Admin Routes ---
router.post('/admin/announcements', requireAuth, adminCtrl.createCommunication);
router.post('/admin/announcements/:id/approve', requireAuth, adminCtrl.approveCommunication);
router.get('/admin/announcements', requireAuth, adminCtrl.getCommunications);
router.get('/admin/announcements/:id', requireAuth, adminCtrl.getCommunicationById);
router.put('/admin/announcements/:id', requireAuth, adminCtrl.updateCommunication);
router.delete('/admin/announcements/:id', requireAuth, adminCtrl.deleteCommunication);
router.get('/admin/announcements/:id/delivery', requireAuth, adminCtrl.getDeliveryStats);

// --- Standard Announcements Aliases (for general portals & dashboards) ---
router.get('/announcements', requireAuth, adminCtrl.getCommunications);
router.post('/announcements', requireAuth, adminCtrl.createCommunication);
router.get('/announcements/:id', requireAuth, adminCtrl.getCommunicationById);
router.put('/announcements/:id', requireAuth, adminCtrl.updateCommunication);
router.delete('/announcements/:id', requireAuth, adminCtrl.deleteCommunication);

// --- Parent Routes ---
// We use requireAuth as the base and authenticateParent adds req.parent
router.post('/parent/complaints', requireAuth, authenticateParent, parentCtrl.submitComplaint);
router.get('/parent/complaints', requireAuth, authenticateParent, parentCtrl.getMyComplaints);
router.get('/parent/conversations', requireAuth, authenticateParent, parentCtrl.getMyConversations);
router.post('/parent/conversations', requireAuth, authenticateParent, parentCtrl.startConversation);
router.get('/parent/conversations/:conversationId/messages', requireAuth, authenticateParent, parentCtrl.getMessages);
router.post('/parent/conversations/:conversationId/messages', requireAuth, authenticateParent, parentCtrl.sendMessage);

// --- Staff Routes ---
router.get('/staff/complaints', requireAuth, authenticateStaff, staffCtrl.getAssignedComplaints);
router.post('/staff/complaints/:id/resolve', requireAuth, authenticateStaff, staffCtrl.resolveComplaint);
router.get('/staff/conversations', requireAuth, authenticateStaff, staffCtrl.getMyConversations);
router.post('/staff/conversations', requireAuth, authenticateStaff, staffCtrl.startConversation);
router.get('/staff/conversations/:conversationId/messages', requireAuth, authenticateStaff, staffCtrl.getMessages);
router.post('/staff/conversations/:conversationId/messages', requireAuth, authenticateStaff, staffCtrl.sendMessage);

// --- Generic Notification Routes (For any authenticated user) ---
router.get('/notifications', requireAuth, notificationCtrl.getMyNotifications);
router.get('/notifications/unread-count', requireAuth, notificationCtrl.getUnreadCount);
router.patch('/notifications/read-all', requireAuth, notificationCtrl.markAllAsRead);
router.patch('/notifications/:id/read', requireAuth, notificationCtrl.markAsRead);
router.patch('/notifications/:id/archive', requireAuth, notificationCtrl.archiveNotification);

// --- Parent-Teacher Meetings ---
router.post('/meetings', requireAuth, meetingCtrl.requestMeeting);
router.get('/meetings', requireAuth, meetingCtrl.getMeetings);
router.put('/meetings/:id', requireAuth, meetingCtrl.updateMeeting);
router.put('/meetings/:id/status', requireAuth, meetingCtrl.updateMeetingStatus);
router.delete('/meetings/:id', requireAuth, meetingCtrl.deleteMeeting);

// --- Direct Queries to Principal (Students, Parents, Teachers, Staff, Drivers) ---
router.post('/principal/queries', requireAuth, principalQueryCtrl.createQuery);
router.get('/principal/queries', requireAuth, principalQueryCtrl.getQueries);
router.put('/principal/queries/:id/reply', requireAuth, principalQueryCtrl.replyToQuery);

export default router;
