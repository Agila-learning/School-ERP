import { Router } from 'express';
import { SafetyController } from '../controllers/safety.controller';
import { protect as requireAuth, requirePermission as checkPermissions } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware as requireTenant } from '../../../core/middlewares/tenant.middleware';

const router = Router();

router.use(requireAuth, requireTenant);

// --- CONFIGURATION ---
router.get('/zones', checkPermissions('safety.view'), SafetyController.getZones);
router.get('/plans', checkPermissions('safety.view'), SafetyController.getEmergencyPlans);

// --- RISKS & HAZARDS ---
router.get('/risks', checkPermissions('safety.risk.manage'), SafetyController.getRisks);
router.get('/hazards', checkPermissions('safety.hazard.manage'), SafetyController.getHazards);
router.post('/hazards', checkPermissions('safety.hazard.manage'), SafetyController.reportHazard);

// --- EMERGENCIES & INCIDENTS ---
router.get('/incidents', checkPermissions('safety.incident.view'), SafetyController.getIncidents);
router.get('/emergencies/active', checkPermissions('safety.view'), SafetyController.getActiveEmergencies);
router.post('/emergencies', checkPermissions('safety.emergency.declare'), SafetyController.declareEmergency);
router.put('/evacuations/:evacuationId/accountability', checkPermissions('safety.rollcall.manage'), SafetyController.updateAccountability);

// --- SECURITY ---
router.get('/security/access-events', checkPermissions('safety.access.view'), SafetyController.getAccessEvents);
router.get('/security/patrols', checkPermissions('safety.patrol.manage'), SafetyController.getPatrols);

export default router;
