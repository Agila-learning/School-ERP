import express from 'express';
import {
  createVersion, publishVersion, updateVersion, deleteVersion, upsertEntry, getEntries, getVersions,
  getClassTimetable, getTeacherTimetable, getRoomTimetable,
  getConflicts, generateTimetable,
  createSubstitutionRequests, assignSubstitute, getPendingSubstitutions,
  deleteEntry, getDashboardStats
} from '../controllers/timetable.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = express.Router();
router.use(tenantMiddleware, protect);

// ── Dashboard ──
router.get('/stats/:versionId', requirePermission('timetable.view'), getDashboardStats);

// ── Versions ──
router.post('/versions', requirePermission('timetable.create'), createVersion);
router.get('/versions', requirePermission('timetable.view'), getVersions);
router.put('/versions/:id', requirePermission('timetable.update'), updateVersion);
router.delete('/versions/:id', requirePermission('timetable.delete'), deleteVersion);
router.patch('/versions/:id/publish', requirePermission('timetable.publish'), publishVersion);

// ── Entries ──
router.get('/entries', requirePermission('timetable.view'), getEntries);
router.post('/entries', requirePermission('timetable.update'), upsertEntry);
router.put('/entries/:entryId', requirePermission('timetable.update'), upsertEntry);
router.delete('/entries/:entryId', requirePermission('timetable.update'), deleteEntry);

// ── Views ──
router.get('/class', requirePermission('timetable.view'), getClassTimetable);
router.get('/teacher/:employeeId', requirePermission('timetable.teacher.view'), getTeacherTimetable);
router.get('/room/:roomId', requirePermission('timetable.room.view'), getRoomTimetable);
router.get('/conflicts/:versionId', requirePermission('timetable.view'), getConflicts);

// ── Auto-generation ──
router.post('/generate', requirePermission('timetable.generate'), generateTimetable);

// ── Substitution ──
router.post('/substitution', requirePermission('timetable.substitution.create'), createSubstitutionRequests);
router.patch('/substitution/:id/assign', requirePermission('timetable.substitution.approve'), assignSubstitute);
router.get('/substitution/pending', requirePermission('timetable.substitution.view'), getPendingSubstitutions);

export default router;
