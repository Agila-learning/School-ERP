import { Response } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { HealthProfileService } from '../services/HealthProfile.service';
import { ClinicOperationsService } from '../services/ClinicOperations.service';
import { MedicationService } from '../services/Medication.service';
import { HealthScreeningService } from '../services/HealthScreening.service';
import { WellnessService } from '../services/Wellness.service';
import { HealthIncidentService } from '../services/HealthIncident.service';
import { HealthAppointmentService } from '../services/HealthAppointment.service';

export class HealthController {
  
  // --- HEALTH PROFILE ---
  static async getHealthProfile(req: TenantRequest, res: Response) {
    const service = new HealthProfileService(req.tenantId!);
    const profile = await service.getProfile(req.params.studentId as string);
    res.json({ success: true, data: profile });
  }

  static async updateHealthProfile(req: TenantRequest, res: Response) {
    const service = new HealthProfileService(req.tenantId!);
    const profile = await service.updateProfile(req.params.studentId as string, req.body);
    res.json({ success: true, data: profile });
  }

  static async getAllergies(req: TenantRequest, res: Response) {
    const service = new HealthProfileService(req.tenantId!);
    const allergies = await service.getAllergies(req.params.studentId as string);
    res.json({ success: true, data: allergies });
  }

  static async addAllergy(req: TenantRequest, res: Response) {
    const service = new HealthProfileService(req.tenantId!);
    const allergy = await service.addAllergy(req.params.studentId as string, req.body);
    res.status(201).json({ success: true, data: allergy });
  }

  // --- CLINIC OPERATIONS ---
  static async getVisits(req: TenantRequest, res: Response) {
    const service = new ClinicOperationsService(req.tenantId!);
    const visits = await service.getVisits(req.query);
    res.json({ success: true, data: visits });
  }

  static async createVisit(req: TenantRequest, res: Response) {
    const service = new ClinicOperationsService(req.tenantId!);
    const visit = await service.createVisit(req.body, req.user?._id);
    res.status(201).json({ success: true, data: visit });
  }

  static async updateVisit(req: TenantRequest, res: Response) {
    const service = new ClinicOperationsService(req.tenantId!);
    const visit = await service.updateVisit(req.params.id as string, req.body);
    res.json({ success: true, data: visit });
  }

  static async deleteVisit(req: TenantRequest, res: Response) {
    const service = new ClinicOperationsService(req.tenantId!);
    await service.deleteVisit(req.params.id as string);
    res.json({ success: true, message: 'Visit deleted successfully' });
  }

  static async getEmergencies(req: TenantRequest, res: Response) {
    const service = new ClinicOperationsService(req.tenantId!);
    const emergencies = await service.getEmergencies(req.query.studentId as string);
    res.json({ success: true, data: emergencies });
  }

  static async reportEmergency(req: TenantRequest, res: Response) {
    const service = new ClinicOperationsService(req.tenantId!);
    const emergency = await service.reportEmergency(req.body, req.user?._id);
    res.status(201).json({ success: true, data: emergency });
  }

  static async updateEmergencyStatus(req: TenantRequest, res: Response) {
    const service = new ClinicOperationsService(req.tenantId!);
    const { status, notes, outcome } = req.body;
    const emergency = await service.updateEmergencyStatus(req.params.id as string, status, notes || outcome);
    res.json({ success: true, data: emergency });
  }

  static async deleteEmergency(req: TenantRequest, res: Response) {
    const service = new ClinicOperationsService(req.tenantId!);
    await service.deleteEmergency(req.params.id as string);
    res.json({ success: true, message: 'Emergency record deleted successfully' });
  }

  // --- MEDICATION ---
  static async getMedications(req: TenantRequest, res: Response) {
    const service = new MedicationService(req.tenantId!);
    const meds = await service.getMedications();
    res.json({ success: true, data: meds });
  }

  static async recordAdministration(req: TenantRequest, res: Response) {
    const service = new MedicationService(req.tenantId!);
    const record = await service.recordAdministration(req.body, req.user._id);
    res.status(201).json({ success: true, data: record });
  }

  // --- SCREENING ---
  static async getScreeningPrograms(req: TenantRequest, res: Response) {
    const service = new HealthScreeningService(req.tenantId!);
    const programs = await service.getPrograms();
    res.json({ success: true, data: programs });
  }

  // --- WELLNESS ---
  static async getWellnessPrograms(req: TenantRequest, res: Response) {
    const programs = await WellnessService.getPrograms(req.tenantId!.toString());
    res.json({ success: true, data: programs });
  }

  static async createWellnessProgram(req: TenantRequest, res: Response) {
    const program = await WellnessService.createProgram(req.tenantId!.toString(), req.body);
    res.status(201).json({ success: true, data: program });
  }

  static async getWellnessCampaigns(req: TenantRequest, res: Response) {
    const campaigns = await WellnessService.getCampaigns(req.tenantId!.toString());
    res.json({ success: true, data: campaigns });
  }

  static async createWellnessCampaign(req: TenantRequest, res: Response) {
    const campaign = await WellnessService.createCampaign(req.tenantId!.toString(), req.body);
    res.status(201).json({ success: true, data: campaign });
  }

  // --- HEALTH INCIDENTS ---
  static async getHealthIncidents(req: TenantRequest, res: Response) {
    const incidents = await HealthIncidentService.getIncidents(req.tenantId!.toString());
    res.json({ success: true, data: incidents });
  }

  static async reportHealthIncident(req: TenantRequest, res: Response) {
    const incident = await HealthIncidentService.reportIncident(req.tenantId!.toString(), req.body, req.user._id);
    res.status(201).json({ success: true, data: incident });
  }

  // --- APPOINTMENTS ---
  static async getHealthAppointments(req: TenantRequest, res: Response) {
    const appointments = await HealthAppointmentService.getAppointments(req.tenantId!.toString());
    res.json({ success: true, data: appointments });
  }

  static async requestHealthAppointment(req: TenantRequest, res: Response) {
    const appointment = await HealthAppointmentService.requestAppointment(req.tenantId!.toString(), req.body);
    res.status(201).json({ success: true, data: appointment });
  }
}
