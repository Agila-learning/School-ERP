import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = Router();

router.use(tenantMiddleware, protect);

// --- HEALTH PROFILES ---
router.get('/students/:studentId/profile', requirePermission('health.view'), HealthController.getHealthProfile);
router.put('/students/:studentId/profile', requirePermission('health.manage'), HealthController.updateHealthProfile);

router.get('/students/:studentId/allergies', requirePermission('health.view'), HealthController.getAllergies);
router.post('/students/:studentId/allergies', requirePermission('health.manage'), HealthController.addAllergy);

// --- CLINIC OPERATIONS & VISITS ---
router.get('/visits', requirePermission('health.view'), HealthController.getVisits);
router.post('/visits', requirePermission('health.manage'), HealthController.createVisit);
router.patch('/visits/:id', requirePermission('health.manage'), HealthController.updateVisit);
router.delete('/visits/:id', requirePermission('health.manage'), HealthController.deleteVisit);

// --- EMERGENCIES ---
router.get('/emergencies', requirePermission('health.view'), HealthController.getEmergencies);
router.post('/emergencies', requirePermission('health.manage'), HealthController.reportEmergency);
router.patch('/emergencies/:id/status', requirePermission('health.manage'), HealthController.updateEmergencyStatus);
router.delete('/emergencies/:id', requirePermission('health.manage'), HealthController.deleteEmergency);

// --- MEDICATION ---
router.get('/medications', requirePermission('health.view'), HealthController.getMedications);
router.post('/medications/administer', requirePermission('health.manage'), HealthController.recordAdministration);

// --- SCREENING ---
router.get('/screenings', requirePermission('health.view'), HealthController.getScreeningPrograms);

// --- WELLNESS ---
router.get('/wellness/programs', requirePermission('health.view'), HealthController.getWellnessPrograms);
router.post('/wellness/programs', requirePermission('health.manage'), HealthController.createWellnessProgram);
router.get('/wellness/campaigns', requirePermission('health.view'), HealthController.getWellnessCampaigns);
router.post('/wellness/campaigns', requirePermission('health.manage'), HealthController.createWellnessCampaign);

// --- INCIDENTS ---
router.get('/incidents', requirePermission('health.view'), HealthController.getHealthIncidents);
router.post('/incidents', requirePermission('health.manage'), HealthController.reportHealthIncident);

// --- APPOINTMENTS ---
router.get('/appointments', requirePermission('health.view'), HealthController.getHealthAppointments);
router.post('/appointments', requirePermission('health.manage'), HealthController.requestHealthAppointment);

export default router;
