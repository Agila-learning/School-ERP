import { Router } from 'express';
import { SecurityController } from '../controllers/security.controller';
import { protect as requireAuth, requirePermission as checkPerm } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware as requireTenant } from '../../../core/middlewares/tenant.middleware';

const router = Router();
router.use(requireAuth, requireTenant);

// ─── DASHBOARD ──────────────────────────────────────────────
router.get('/dashboard', checkPerm('security.view'), SecurityController.getDashboard);

// ─── ADVANCED VISITOR MANAGEMENT (VMS) ─────────────────────
router.get('/visitors/stats', checkPerm('security.visitor.view'), SecurityController.getVisitorStats);
router.get('/visitors/hosts', checkPerm('security.visitor.view'), SecurityController.getHosts);
router.get('/hosts', checkPerm('security.visitor.view'), SecurityController.getHosts);
router.post('/visitors/check-in', checkPerm('security.visitor.manage'), SecurityController.checkInVisitor);
router.post('/visitors/:id/check-out', checkPerm('security.visitor.manage'), SecurityController.checkOutVisitor);
router.put('/visitors/:id/approve', checkPerm('security.visitor.manage'), SecurityController.approveVisit);
router.put('/visitors/:id/extend', checkPerm('security.visitor.manage'), SecurityController.extendPass);
router.post('/visitors/smart-register', checkPerm('security.visitor.manage'), SecurityController.smartRegisterVisitor);

// ─── VISITORS (STANDARD & ADVANCED) ─────────────────────────
router.get('/visitors', checkPerm('security.visitor.view'), SecurityController.getVisitors);
router.post('/visitors', checkPerm('security.visitor.manage'), SecurityController.registerVisitor);

// ─── PRE-REGISTRATION ───────────────────────────────────────
router.get('/pre-registrations', checkPerm('security.visitor.view'), SecurityController.getPreRegistrations);
router.post('/pre-registrations', checkPerm('security.visitor.manage'), SecurityController.createPreRegistration);
router.put('/pre-registrations/:id/approve', checkPerm('security.visitor.manage'), SecurityController.approvePreRegistration);

// ─── VISITOR PASSES ─────────────────────────────────────────
router.post('/visitors/:visitorId/pass', checkPerm('security.pass.manage'), SecurityController.issueVisitorPass);
router.get('/visitor-passes', checkPerm('security.visitor.view'), SecurityController.getActiveVisitorPasses);
router.put('/visitor-passes/:id/revoke', checkPerm('security.pass.manage'), SecurityController.revokeVisitorPass);

// ─── GATES ──────────────────────────────────────────────────
router.get('/gates', checkPerm('security.view'), SecurityController.getGates);
router.post('/gates', checkPerm('security.gate.manage'), SecurityController.createGate);
router.get('/gate-entries', checkPerm('security.gate.view'), SecurityController.getGateEntries);
router.post('/gate-entries', checkPerm('security.gate.manage'), SecurityController.recordGateEntry);
router.post('/gate-exits/:entryId', checkPerm('security.gate.manage'), SecurityController.recordGateExit);

// ─── GATE PASSES ─────────────────────────────────────────────
router.get('/gate-passes', checkPerm('security.pass.view'), SecurityController.getGatePasses);
router.post('/gate-passes', checkPerm('security.pass.manage'), SecurityController.issueGatePass);

// ─── PICKUP ─────────────────────────────────────────────────
router.get('/pickup/authorized/:studentId', checkPerm('security.pickup.view'), SecurityController.getAuthorizedPickupPersons);
router.post('/pickup/authorized', checkPerm('security.pickup.manage'), SecurityController.addAuthorizedPickupPerson);
router.get('/pickup/requests', checkPerm('security.pickup.view'), SecurityController.getPickupRequests);
router.post('/pickup/requests', checkPerm('security.pickup.manage'), SecurityController.createPickupRequest);
router.put('/pickup/requests/:id/process', checkPerm('security.pickup.manage'), SecurityController.processPickupRequest);
router.put('/pickup/requests/:id/release', checkPerm('security.pickup.release'), SecurityController.releaseStudent);

// ─── VEHICLES ───────────────────────────────────────────────
router.get('/vehicles', checkPerm('security.vehicle.view'), SecurityController.getVehicles);
router.post('/vehicles', checkPerm('security.vehicle.manage'), SecurityController.registerVehicle);
router.get('/vehicle-entries', checkPerm('security.vehicle.view'), SecurityController.getVehicleEntries);
router.post('/vehicle-entries', checkPerm('security.vehicle.manage'), SecurityController.recordVehicleEntry);
router.put('/vehicle-entries/:entryId/exit', checkPerm('security.vehicle.manage'), SecurityController.recordVehicleExit);
router.get('/parking', checkPerm('security.view'), SecurityController.getParkingAreas);

// ─── DELIVERIES ─────────────────────────────────────────────
router.get('/deliveries', checkPerm('security.delivery.view'), SecurityController.getDeliveries);
router.post('/deliveries', checkPerm('security.delivery.manage'), SecurityController.recordDelivery);
router.get('/contractors', checkPerm('security.contractor.view'), SecurityController.getContractorAccesses);
router.post('/contractors', checkPerm('security.contractor.manage'), SecurityController.addContractorAccess);

// ─── INCIDENTS ──────────────────────────────────────────────
router.get('/incidents', checkPerm('security.incident.view'), SecurityController.getSecurityIncidents);
router.post('/incidents', checkPerm('security.incident.manage'), SecurityController.reportSecurityIncident);
router.put('/incidents/:id/status', checkPerm('security.incident.manage'), SecurityController.updateIncidentStatus);
router.get('/alerts', checkPerm('security.view'), SecurityController.getSecurityAlerts);
router.post('/alerts', checkPerm('security.incident.manage'), SecurityController.createSecurityAlert);

// ─── LOCKDOWN ────────────────────────────────────────────────
router.get('/lockdowns', checkPerm('security.lockdown.view'), SecurityController.getActiveLockdowns);
router.post('/lockdowns', checkPerm('security.lockdown.manage'), SecurityController.activateLockdown);
router.put('/lockdowns/:id/all-clear', checkPerm('security.lockdown.manage'), SecurityController.issueAllClear);

// ─── SHIFTS ─────────────────────────────────────────────────
router.get('/shifts', checkPerm('security.shift.view'), SecurityController.getShifts);
router.post('/shifts', checkPerm('security.shift.manage'), SecurityController.createShift);
router.post('/handovers', checkPerm('security.shift.manage'), SecurityController.createHandover);

// ─── RESTRICTED AREAS ────────────────────────────────────────
router.get('/restricted-areas', checkPerm('security.areas.view'), SecurityController.getRestrictedAreas);
router.post('/restricted-areas', checkPerm('security.areas.manage'), SecurityController.createRestrictedArea);
router.post('/temporary-access', checkPerm('security.areas.manage'), SecurityController.createTemporaryAccess);

// ─── LOST & FOUND ────────────────────────────────────────────
router.get('/lost-found', checkPerm('security.view'), SecurityController.getLostFound);
router.post('/lost-found', checkPerm('security.gate.manage'), SecurityController.createLostFound);
router.put('/lost-found/:id/claim', checkPerm('security.gate.manage'), SecurityController.claimLostFound);
router.delete('/lost-found/:id', checkPerm('security.gate.manage'), SecurityController.deleteLostFound);

export default router;
