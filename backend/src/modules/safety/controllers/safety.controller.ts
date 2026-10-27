import { Response } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { SafetyConfigurationService } from '../services/SafetyConfiguration.service';
import { RiskAndHazardService } from '../services/RiskAndHazard.service';
import { EmergencyOperationsService } from '../services/EmergencyOperations.service';
import { SecurityOperationsService } from '../services/SecurityOperations.service';

export class SafetyController {
  
  // --- ZONES & PLANS ---
  static async getZones(req: TenantRequest, res: Response) {
    const service = new SafetyConfigurationService(req.tenantId!);
    const zones = await service.getZones();
    res.json({ success: true, data: zones });
  }

  static async getEmergencyPlans(req: TenantRequest, res: Response) {
    const service = new SafetyConfigurationService(req.tenantId!);
    const plans = await service.getPlans();
    res.json({ success: true, data: plans });
  }

  // --- RISKS & HAZARDS ---
  static async getRisks(req: TenantRequest, res: Response) {
    const service = new RiskAndHazardService(req.tenantId!);
    const risks = await service.getRisks();
    res.json({ success: true, data: risks });
  }

  static async getHazards(req: TenantRequest, res: Response) {
    const service = new RiskAndHazardService(req.tenantId!);
    const hazards = await service.getHazards();
    res.json({ success: true, data: hazards });
  }

  static async reportHazard(req: TenantRequest, res: Response) {
    const service = new RiskAndHazardService(req.tenantId!);
    const hazard = await service.createHazard(req.body, req.user._id);
    res.status(201).json({ success: true, data: hazard });
  }

  // --- EMERGENCIES & INCIDENTS ---
  static async getIncidents(req: TenantRequest, res: Response) {
    const service = new EmergencyOperationsService(req.tenantId!);
    const incidents = await service.getIncidents();
    res.json({ success: true, data: incidents });
  }

  static async getActiveEmergencies(req: TenantRequest, res: Response) {
    const service = new EmergencyOperationsService(req.tenantId!);
    const emergencies = await service.getActiveEmergencies();
    res.json({ success: true, data: emergencies });
  }

  static async declareEmergency(req: TenantRequest, res: Response) {
    const service = new EmergencyOperationsService(req.tenantId!);
    const emergency = await service.declareEmergency(req.body, req.user._id);
    res.status(201).json({ success: true, data: emergency });
  }

  static async updateAccountability(req: TenantRequest, res: Response) {
    const service = new EmergencyOperationsService(req.tenantId!);
    const results = await service.updateAccountability(req.params.evacuationId as string, req.body.records, req.user._id);
    res.json({ success: true, data: results });
  }

  // --- SECURITY ---
  static async getAccessEvents(req: TenantRequest, res: Response) {
    const service = new SecurityOperationsService(req.tenantId!);
    const events = await service.getAccessEvents(req.query);
    res.json({ success: true, data: events });
  }

  static async getPatrols(req: TenantRequest, res: Response) {
    const service = new SecurityOperationsService(req.tenantId!);
    const patrols = await service.getPatrols();
    res.json({ success: true, data: patrols });
  }
}
