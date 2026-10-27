import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler, notFound } from './core/middlewares/error.middleware';
import authRoutes from './modules/auth/routes/auth.routes';
import orgRoutes from './modules/organization/routes/organization.routes';
import academicRoutes from './modules/academic/routes/academic.routes';
import learningRoutes from './modules/academic/routes/learning.routes';
import tenantRoutes from './modules/tenant/routes/tenant.routes';
import onboardingRoutes from './modules/tenant/routes/onboarding.routes';
import configRoutes from './modules/config/routes/config.routes';
import admissionRoutes from './modules/admission/routes/admission.routes';
import studentRoutes from './modules/students/routes/student.routes';
import hrRoutes from './modules/hr/routes/hr.routes';
import attendanceRoutes from './modules/attendance/routes/attendance.routes';
import timetableRoutes from './modules/timetable/routes/timetable.routes';
import financeRoutes from './modules/finance/routes/finance.routes';
import accountingRoutes from './modules/accounting/routes/accounting.routes';
import examRoutes from './modules/examination/routes/exam.routes';
import parentsRoutes from './modules/parents/routes/parents.routes';
import parentPortalRoutes from './modules/parent-portal/routes/parent-portal.routes';
import studentPortalRoutes from './modules/student-portal/routes/student-portal.routes';
import staffPortalRoutes from './modules/staff-portal/routes/staff-portal.routes';
import inventoryRoutes from './modules/inventory/routes/inventory.routes';
import procurementRoutes from './modules/procurement/routes/procurement.routes';
import assetRoutes from './modules/assets/routes/asset.routes';
import vendorRoutes from './modules/vendors/routes/vendor.routes';
import libraryRoutes from './modules/library/routes/library.routes';
import communicationRoutes from './modules/communication/communication.routes';
import safetyRoutes from './modules/safety/routes/safety.routes';
import alumniRoutes from './modules/alumni/alumni.routes';
import eventsRoutes from './modules/events/events.routes';
import engagementRoutes from './modules/engagement/engagement.routes';
import careerRoutes from './modules/career/career.routes';
import operationsRoutes from './modules/operations/operations.routes';
import facilitiesRoutes from './modules/organization/facilities.routes';
import hostelRoutes from './modules/hostel/routes/hostel.routes';
import healthRoutes from './modules/health/routes/health.routes';
import securityRoutes from './modules/security/routes/security.routes';
import promotionRoutes from './modules/promotion/routes/promotion.routes';
import adminRoutes from './modules/admin/routes/admin.routes';
import superAdminRoutes from './modules/super-admin/routes/superAdmin.routes';
import complaintsRoutes from './modules/complaints/routes/complaints.routes';
import userRoutes from './modules/auth/routes/user.routes';
import invitationRoutes from './modules/auth/routes/invitation.routes';
import auditRoutes from './modules/audit/routes/audit.routes';
import transportRoutes from './modules/transport/routes/transport.routes';
import principalRoutes from './modules/principal/routes/principal.routes';
import labRoutes from './modules/lab/routes/lab.routes';
import sportsRoutes from './modules/sports/routes/sports.routes';
import documentRoutes from './modules/documents/routes/document.routes';
import path from 'path';
import { DeliveryQueueService } from './modules/communication/services/DeliveryQueue.service';
import { communicationScheduler } from './modules/communication/services/Scheduler.service';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static storage/uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/tenant', tenantRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/organization', orgRoutes);
app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/learning', learningRoutes);
app.use('/api/v1/config', configRoutes);
app.use('/api/v1/admission', admissionRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/hr', hrRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/accounting', accountingRoutes);
app.use('/api/v1/exam', examRoutes);
app.use('/api/v1/transport', transportRoutes);
app.use('/api/v1/hostel', hostelRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/safety', safetyRoutes);
app.use('/api/v1/alumni', alumniRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/engagement', engagementRoutes);
app.use('/api/v1/career', careerRoutes);
app.use('/api/v1/operations', operationsRoutes);
app.use('/api/v1/facilities', facilitiesRoutes);
app.use('/api/v1/library', libraryRoutes);
app.use('/api/v1/parents', parentsRoutes);
app.use('/api/v1/parent-portal', parentPortalRoutes);
app.use('/api/v1/student-portal', studentPortalRoutes);
app.use('/api/v1/staff-portal', staffPortalRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/procurement', procurementRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/lab', labRoutes);
app.use('/api/v1/sports', sportsRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/security', securityRoutes);
app.use('/api/v1/communication', communicationRoutes);
app.use('/api/v1/promotion', promotionRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);
app.use('/api/v1/complaints', complaintsRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/principal', principalRoutes);
app.use('/api/v1/documents', documentRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

import http from 'http';
import { initSocket } from './core/services/socket.service';

// Start server
const startServer = async () => {
  await connectDB();
  
  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    DeliveryQueueService.startQueueWorker();
    communicationScheduler.startPolling();
  });
};

startServer();
