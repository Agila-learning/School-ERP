import { Response } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { SecurityService } from '../services/security.service';

const svc = (req: TenantRequest) => new SecurityService(req.tenantId!.toString());
const uid = (req: TenantRequest): string => String(req.user._id);
const pid = (v: any): string => String(v);

export class SecurityController {

  // ─── VISITORS & ADVANCED VMS ─────────────────────────────────
  static async getDashboard(req: TenantRequest, res: Response) {
    const stats = await svc(req).getDashboardStats();
    res.json({ success: true, data: stats });
  }

  static async getVisitorStats(req: TenantRequest, res: Response) {
    try {
      const stats = await svc(req).getVisitorDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getAdvancedVisitors(req: TenantRequest, res: Response) {
    try {
      const userRole = (req.user as any)?.role || (req.user as any)?.roles?.[0]?.name || 'ADMIN';
      const result = await svc(req).getAdvancedVisitors(req.query, userRole);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getVisitors(req: TenantRequest, res: Response) {
    // If request asks for advanced VMS format or filters
    if (req.query.vms === 'advanced' || req.query.search || req.query.page) {
      const userRole = (req.user as any)?.role || (req.user as any)?.roles?.[0]?.name || 'ADMIN';
      const result = await svc(req).getAdvancedVisitors(req.query, userRole);
      return res.json({ success: true, data: result });
    }
    const visitors = await svc(req).getVisitors(req.query);
    res.json({ success: true, data: visitors });
  }

  static async smartRegisterVisitor(req: TenantRequest, res: Response) {
    try {
      const visit = await svc(req).smartRegisterVisitor(req.body, uid(req));
      res.status(201).json({ success: true, data: visit, message: 'Visitor registered successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async registerVisitor(req: TenantRequest, res: Response) {
    if (req.body.visitorCategory || req.body.hostName || req.body.phone) {
      return SecurityController.smartRegisterVisitor(req, res);
    }
    const visitor = await svc(req).registerVisitor(req.body);
    res.status(201).json({ success: true, data: visitor });
  }

  static async checkInVisitor(req: TenantRequest, res: Response) {
    try {
      const identifier = req.body.identifier || req.params.id;
      const visit = await svc(req).checkInVisitor(identifier, uid(req));
      res.json({ success: true, data: visit, message: 'Visitor checked in successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async checkOutVisitor(req: TenantRequest, res: Response) {
    try {
      const visit = await svc(req).checkOutVisitor(req.params.id, req.body?.notes, uid(req));
      res.json({ success: true, data: visit, message: 'Visitor checked out successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async approveVisit(req: TenantRequest, res: Response) {
    try {
      const { action, reason } = req.body;
      const visit = await svc(req).approveOrRejectVisit(req.params.id, action, reason, uid(req));
      res.json({ success: true, data: visit, message: `Visit ${action.toLowerCase()}ed successfully` });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async extendPass(req: TenantRequest, res: Response) {
    try {
      const { newDeparture, reason } = req.body;
      const visit = await svc(req).extendVisitorPass(req.params.id, newDeparture, reason, uid(req));
      res.json({ success: true, data: visit, message: 'Visitor pass extended successfully' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getHosts(req: TenantRequest, res: Response) {
    try {
      const hosts = await svc(req).getHostsList();
      res.json({ success: true, data: hosts });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── PRE-REGISTRATION ───────────────────────────────────────
  static async getPreRegistrations(req: TenantRequest, res: Response) {
    const list = await svc(req).getPreRegistrations(req.query);
    res.json({ success: true, data: list });
  }
  static async createPreRegistration(req: TenantRequest, res: Response) {
    const preReg = await svc(req).createPreRegistration(req.body, uid(req));
    res.status(201).json({ success: true, data: preReg });
  }
  static async approvePreRegistration(req: TenantRequest, res: Response) {
    const { action, reason } = req.body;
    const preReg = await svc(req).approvePreRegistration(pid(req.params.id), uid(req), action, reason);
    res.json({ success: true, data: preReg });
  }

  // ─── VISITOR PASSES ─────────────────────────────────────────
  static async issueVisitorPass(req: TenantRequest, res: Response) {
    const pass = await svc(req).issueVisitorPass(pid(req.params.visitorId), req.body, uid(req));
    res.status(201).json({ success: true, data: pass });
  }
  static async getActiveVisitorPasses(req: TenantRequest, res: Response) {
    const passes = await svc(req).getActiveVisitorPasses();
    res.json({ success: true, data: passes });
  }
  static async revokeVisitorPass(req: TenantRequest, res: Response) {
    const pass = await svc(req).revokeVisitorPass(pid(req.params.id), uid(req), req.body.reason);
    res.json({ success: true, data: pass });
  }

  // ─── GATES ──────────────────────────────────────────────────
  static async getGates(req: TenantRequest, res: Response) {
    const gates = await svc(req).getGates();
    res.json({ success: true, data: gates });
  }
  static async createGate(req: TenantRequest, res: Response) {
    const gate = await svc(req).createGate(req.body);
    res.status(201).json({ success: true, data: gate });
  }
  static async recordGateEntry(req: TenantRequest, res: Response) {
    const entry = await svc(req).recordGateEntry(req.body, uid(req));
    res.status(201).json({ success: true, data: entry });
  }
  static async recordGateExit(req: TenantRequest, res: Response) {
    const exit = await svc(req).recordGateExit(pid(req.params.entryId), req.body, uid(req));
    res.status(201).json({ success: true, data: exit });
  }
  static async getGateEntries(req: TenantRequest, res: Response) {
    const entries = await svc(req).getGateEntries(req.query);
    res.json({ success: true, data: entries });
  }
  static async issueGatePass(req: TenantRequest, res: Response) {
    const pass = await svc(req).issueGatePass(req.body, uid(req));
    res.status(201).json({ success: true, data: pass });
  }
  static async getGatePasses(req: TenantRequest, res: Response) {
    const passes = await svc(req).getGatePasses(req.query);
    res.json({ success: true, data: passes });
  }

  // ─── PICKUP ─────────────────────────────────────────────────
  static async getAuthorizedPickupPersons(req: TenantRequest, res: Response) {
    const persons = await svc(req).getAuthorizedPickupPersons(pid(req.params.studentId));
    res.json({ success: true, data: persons });
  }
  static async addAuthorizedPickupPerson(req: TenantRequest, res: Response) {
    const person = await svc(req).addAuthorizedPickupPerson(req.body);
    res.status(201).json({ success: true, data: person });
  }
  static async getPickupRequests(req: TenantRequest, res: Response) {
    const requests = await svc(req).getPickupRequests(req.query);
    res.json({ success: true, data: requests });
  }
  static async createPickupRequest(req: TenantRequest, res: Response) {
    const request = await svc(req).createPickupRequest(req.body, uid(req));
    res.status(201).json({ success: true, data: request });
  }
  static async processPickupRequest(req: TenantRequest, res: Response) {
    const { action, notes } = req.body;
    const request = await svc(req).processPickupRequest(pid(req.params.id), action, uid(req), notes);
    res.json({ success: true, data: request });
  }
  static async releaseStudent(req: TenantRequest, res: Response) {
    const request = await svc(req).releaseStudent(pid(req.params.id), uid(req), uid(req));
    res.json({ success: true, data: request });
  }

  // ─── VEHICLES ───────────────────────────────────────────────
  static async getVehicles(req: TenantRequest, res: Response) {
    const vehicles = await svc(req).getVehicles(req.query);
    res.json({ success: true, data: vehicles });
  }
  static async registerVehicle(req: TenantRequest, res: Response) {
    const vehicle = await svc(req).registerVehicle(req.body);
    res.status(201).json({ success: true, data: vehicle });
  }
  static async recordVehicleEntry(req: TenantRequest, res: Response) {
    const entry = await svc(req).recordVehicleEntry(req.body, uid(req));
    res.status(201).json({ success: true, data: entry });
  }
  static async recordVehicleExit(req: TenantRequest, res: Response) {
    const entry = await svc(req).recordVehicleExit(pid(req.params.entryId), uid(req));
    res.json({ success: true, data: entry });
  }
  static async getVehicleEntries(req: TenantRequest, res: Response) {
    const entries = await svc(req).getVehicleEntries(req.query);
    res.json({ success: true, data: entries });
  }
  static async getParkingAreas(req: TenantRequest, res: Response) {
    const areas = await svc(req).getParkingAreas();
    res.json({ success: true, data: areas });
  }

  // ─── DELIVERIES ─────────────────────────────────────────────
  static async getDeliveries(req: TenantRequest, res: Response) {
    const deliveries = await svc(req).getDeliveries(req.query);
    res.json({ success: true, data: deliveries });
  }
  static async recordDelivery(req: TenantRequest, res: Response) {
    const delivery = await svc(req).recordDelivery(req.body, uid(req));
    res.status(201).json({ success: true, data: delivery });
  }
  static async getContractorAccesses(req: TenantRequest, res: Response) {
    const list = await svc(req).getContractorAccesses(req.query);
    res.json({ success: true, data: list });
  }
  static async addContractorAccess(req: TenantRequest, res: Response) {
    const access = await svc(req).addContractorAccess(req.body);
    res.status(201).json({ success: true, data: access });
  }

  // ─── INCIDENTS ──────────────────────────────────────────────
  static async getSecurityIncidents(req: TenantRequest, res: Response) {
    const incidents = await svc(req).getSecurityIncidents(req.query);
    res.json({ success: true, data: incidents });
  }
  static async reportSecurityIncident(req: TenantRequest, res: Response) {
    const incident = await svc(req).reportSecurityIncident(req.body, uid(req));
    res.status(201).json({ success: true, data: incident });
  }
  static async updateIncidentStatus(req: TenantRequest, res: Response) {
    const incident = await svc(req).updateIncidentStatus(pid(req.params.id), req.body.status, uid(req), req.body.notes);
    res.json({ success: true, data: incident });
  }
  static async getSecurityAlerts(req: TenantRequest, res: Response) {
    const alerts = await svc(req).getSecurityAlerts();
    res.json({ success: true, data: alerts });
  }
  static async createSecurityAlert(req: TenantRequest, res: Response) {
    const alert = await svc(req).createSecurityAlert(req.body, uid(req));
    res.status(201).json({ success: true, data: alert });
  }

  // ─── LOCKDOWN ────────────────────────────────────────────────
  static async activateLockdown(req: TenantRequest, res: Response) {
    const lockdown = await svc(req).activateLockdown(req.body, uid(req));
    res.status(201).json({ success: true, data: lockdown });
  }
  static async issueAllClear(req: TenantRequest, res: Response) {
    const lockdown = await svc(req).issueAllClear(pid(req.params.id), uid(req), req.body.reason);
    res.json({ success: true, data: lockdown });
  }
  static async getActiveLockdowns(req: TenantRequest, res: Response) {
    const lockdowns = await svc(req).getActiveLockdowns();
    res.json({ success: true, data: lockdowns });
  }

  // ─── SHIFTS ─────────────────────────────────────────────────
  static async getShifts(req: TenantRequest, res: Response) {
    const shifts = await svc(req).getShifts(req.query);
    res.json({ success: true, data: shifts });
  }
  static async createShift(req: TenantRequest, res: Response) {
    const shift = await svc(req).createShift(req.body);
    res.status(201).json({ success: true, data: shift });
  }
  static async createHandover(req: TenantRequest, res: Response) {
    const handover = await svc(req).createHandover(req.body);
    res.status(201).json({ success: true, data: handover });
  }

  // ─── RESTRICTED AREAS ────────────────────────────────────────
  static async getRestrictedAreas(req: TenantRequest, res: Response) {
    const areas = await svc(req).getRestrictedAreas();
    res.json({ success: true, data: areas });
  }
  static async createRestrictedArea(req: TenantRequest, res: Response) {
    const area = await svc(req).createRestrictedArea(req.body);
    res.status(201).json({ success: true, data: area });
  }
  static async createTemporaryAccess(req: TenantRequest, res: Response) {
    const access = await svc(req).createTemporaryAccess(req.body, uid(req));
    res.status(201).json({ success: true, data: access });
  }

  // ─── LOST & FOUND ────────────────────────────────────────────
  static async getLostFound(req: TenantRequest, res: Response) {
    const items = await svc(req).getLostFoundItems(req.query);
    res.json({ success: true, data: items });
  }
  static async createLostFound(req: TenantRequest, res: Response) {
    const item = await svc(req).createLostFoundItem(req.body);
    res.status(201).json({ success: true, data: item });
  }
  static async claimLostFound(req: TenantRequest, res: Response) {
    const item = await svc(req).claimLostFoundItem(pid(req.params.id), req.body);
    res.json({ success: true, data: item });
  }
  static async deleteLostFound(req: TenantRequest, res: Response) {
    await svc(req).deleteLostFoundItem(pid(req.params.id));
    res.json({ success: true, message: 'Item deleted' });
  }
}
