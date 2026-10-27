import { Response, NextFunction } from 'express';
import { TenantRequest } from '../../../core/middlewares/tenant.middleware';
import { sendResponse } from '../../../core/utils/response.util';
import { HostelService } from '../services/hostel.service';
import { HostelAllocationService } from '../services/hostel-allocation.service';
import { HostelOperationsService } from '../services/hostel-operations.service';
import { MessService } from '../services/mess.service';
import { HostelAttendanceService } from '../services/hostel-attendance.service';
import { HostelComplaintService } from '../services/hostel-complaint.service';
import { HostelVisitorService } from '../services/hostel-visitor.service';

export class HostelController {
  
  // --- STRUCTURE ---
  static async getDashboardStats(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.getDashboardStats();
      sendResponse({ res, message: 'Stats fetched', data });
    } catch (err) { next(err); }
  }

  static async getHostels(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.getHostels(req.query.branchId as string);
      sendResponse({ res, message: 'Hostels fetched', data });
    } catch (err) { next(err); }
  }

  static async createHostel(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.createHostel(req.body);
      sendResponse({ res, status: 201, message: 'Hostel created', data });
    } catch (err) { next(err); }
  }

  static async updateHostel(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.updateHostel(req.params.id as string, req.body);
      sendResponse({ res, message: 'Hostel updated', data });
    } catch (err) { next(err); }
  }

  static async deleteHostel(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.deleteHostel(req.params.id as string);
      sendResponse({ res, message: 'Hostel deleted', data });
    } catch (err) { next(err); }
  }

  static async getBuildings(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.getBuildings(req.query.hostelId as string);
      sendResponse({ res, message: 'Buildings fetched', data });
    } catch (err) { next(err); }
  }

  static async createBuilding(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.createBuilding(req.body.hostelId, req.body);
      sendResponse({ res, status: 201, message: 'Building created', data });
    } catch (err) { next(err); }
  }

  static async updateBuilding(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.updateBuilding(req.params.id as string, req.body);
      sendResponse({ res, message: 'Building updated', data });
    } catch (err) { next(err); }
  }

  static async deleteBuilding(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.deleteBuilding(req.params.id as string);
      sendResponse({ res, message: 'Building deleted', data });
    } catch (err) { next(err); }
  }

  static async getBlocks(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.getBlocks(req.query.buildingId as string);
      sendResponse({ res, message: 'Blocks fetched', data });
    } catch (err) { next(err); }
  }

  static async createBlock(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.createBlock(req.body.buildingId, req.body);
      sendResponse({ res, status: 201, message: 'Block created', data });
    } catch (err) { next(err); }
  }

  static async updateBlock(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.updateBlock(req.params.id as string, req.body);
      sendResponse({ res, message: 'Block updated', data });
    } catch (err) { next(err); }
  }

  static async deleteBlock(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.deleteBlock(req.params.id as string);
      sendResponse({ res, message: 'Block deleted', data });
    } catch (err) { next(err); }
  }

  static async getFloors(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.getFloors(req.query.blockId as string);
      sendResponse({ res, message: 'Floors fetched', data });
    } catch (err) { next(err); }
  }

  static async createFloor(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.createFloor(req.body.blockId, req.body);
      sendResponse({ res, status: 201, message: 'Floor created', data });
    } catch (err) { next(err); }
  }

  static async updateFloor(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.updateFloor(req.params.id as string, req.body);
      sendResponse({ res, message: 'Floor updated', data });
    } catch (err) { next(err); }
  }

  static async deleteFloor(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.deleteFloor(req.params.id as string);
      sendResponse({ res, message: 'Floor deleted', data });
    } catch (err) { next(err); }
  }

  static async getRooms(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.getRooms(req.query.floorId as string);
      sendResponse({ res, message: 'Rooms fetched', data });
    } catch (err) { next(err); }
  }

  static async createRoom(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.createRoom(req.body);
      sendResponse({ res, status: 201, message: 'Room created', data });
    } catch (err) { next(err); }
  }

  static async updateRoom(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.updateRoom(req.params.id as string, req.body);
      sendResponse({ res, message: 'Room updated', data });
    } catch (err) { next(err); }
  }

  static async deleteRoom(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.deleteRoom(req.params.id as string);
      sendResponse({ res, message: 'Room deleted', data });
    } catch (err) { next(err); }
  }

  static async getBeds(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.getBeds(req.query.roomId as string);
      sendResponse({ res, message: 'Beds fetched', data });
    } catch (err) { next(err); }
  }

  static async createBed(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.createBed(req.body.roomId, req.body);
      sendResponse({ res, status: 201, message: 'Bed created', data });
    } catch (err) { next(err); }
  }

  static async updateBed(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.updateBed(req.params.id as string, req.body);
      sendResponse({ res, message: 'Bed updated', data });
    } catch (err) { next(err); }
  }

  static async deleteBed(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelService(req.tenantId as any);
      const data = await svc.deleteBed(req.params.id as string);
      sendResponse({ res, message: 'Bed deleted', data });
    } catch (err) { next(err); }
  }

  // --- ALLOCATION ---
  static async getApplications(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelAllocationService(req.tenantId as any);
      const data = await svc.getApplications(req.query.hostelId as string);
      sendResponse({ res, message: 'Applications fetched', data });
    } catch (err) { next(err); }
  }

  static async createApplication(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelAllocationService(req.tenantId as any);
      const data = await svc.createApplication(req.body);
      sendResponse({ res, status: 201, message: 'Application created', data });
    } catch (err) { next(err); }
  }

  static async getAllocations(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelAllocationService(req.tenantId as any);
      const data = await svc.getAllocations(req.query.hostelId as string);
      sendResponse({ res, message: 'Allocations fetched', data });
    } catch (err) { next(err); }
  }

  static async allocateBed(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelAllocationService(req.tenantId as any);
      const data = await svc.allocateBed(req.body.studentId, req.body.bedId, req.body.academicYearId);
      sendResponse({ res, status: 201, message: 'Bed allocated', data });
    } catch (err) { next(err); }
  }

  static async checkIn(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelAllocationService(req.tenantId as any);
      const data = await svc.checkInStudent(req.body.allocationId, req.user?._id as any, req.body.condition, req.body.remarks);
      sendResponse({ res, status: 201, message: 'Checked In successfully', data });
    } catch (err) { next(err); }
  }

  static async checkOut(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelAllocationService(req.tenantId as any);
      const data = await svc.checkOutStudent(req.body.allocationId, req.user?._id as any, req.body.reason, req.body.roomCondition);
      sendResponse({ res, status: 201, message: 'Checked Out successfully', data });
    } catch (err) { next(err); }
  }

  static async transferRoom(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelAllocationService(req.tenantId as any);
      const data = await svc.transferRoom(req.body.transferId, req.body.targetBedId, req.user?._id as any);
      sendResponse({ res, status: 201, message: 'Room transferred successfully', data });
    } catch (err) { next(err); }
  }



  // --- OPERATIONS ---
  static async getOutpasses(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelOperationsService(req.tenantId as any);
      const data = await svc.getOutpasses(req.query.hostelId as string);
      sendResponse({ res, message: 'Outpasses fetched', data });
    } catch (err) { next(err); }
  }

  static async createOutpass(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelOperationsService(req.tenantId as any);
      const data = await svc.createOutpass(req.body);
      sendResponse({ res, status: 201, message: 'Outpass created', data });
    } catch (err) { next(err); }
  }

  // --- ATTENDANCE ---
  static async getAttendance(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelAttendanceService(req.tenantId as any);
      const data = await svc.getAttendance(req.query.hostelId as string, req.query.date as string, req.query.rollCallType as string);
      sendResponse({ res, message: 'Attendance fetched', data });
    } catch (err) { next(err); }
  }

  static async markAttendance(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelAttendanceService(req.tenantId as any);
      const data = await svc.markAttendance(req.body, req.user?._id as any);
      sendResponse({ res, status: 201, message: 'Attendance marked successfully', data });
    } catch (err) { next(err); }
  }

  static async getActiveStudentsForAttendance(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelAttendanceService(req.tenantId as any);
      const data = await svc.getActiveStudentsForAttendance(req.query.hostelId as string);
      sendResponse({ res, message: 'Active students fetched', data });
    } catch (err) { next(err); }
  }

  // --- COMPLAINTS ---
  static async getComplaints(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelComplaintService(req.tenantId as any);
      const data = await svc.getComplaints(req.query.hostelId as string, req.query.status as string);
      sendResponse({ res, message: 'Complaints fetched', data });
    } catch (err) { next(err); }
  }

  static async getMyComplaints(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelComplaintService(req.tenantId as any);
      const data = await svc.getMyComplaints(req.user?._id as any);
      sendResponse({ res, message: 'My complaints fetched', data });
    } catch (err) { next(err); }
  }

  static async createComplaint(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelComplaintService(req.tenantId as any);
      const data = await svc.createComplaint({ ...req.body, raisedByUserId: req.user?._id });
      sendResponse({ res, status: 201, message: 'Complaint created', data });
    } catch (err) { next(err); }
  }

  static async updateComplaintStatus(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelComplaintService(req.tenantId as any);
      const data = await svc.updateComplaintStatus(req.params.id as string, req.body.status, req.body.notes, req.body.assignedToUserId);
      sendResponse({ res, message: 'Complaint status updated', data });
    } catch (err) { next(err); }
  }

  // --- VISITORS ---
  static async getVisitors(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelVisitorService(req.tenantId as any);
      const data = await svc.getVisitors(req.query.hostelId as string, req.query.status as string);
      sendResponse({ res, message: 'Visitors fetched', data });
    } catch (err) { next(err); }
  }

  static async checkInVisitor(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelVisitorService(req.tenantId as any);
      const data = await svc.checkInVisitor({ ...req.body, approvedByUserId: req.user?._id });
      sendResponse({ res, status: 201, message: 'Visitor checked in', data });
    } catch (err) { next(err); }
  }

  static async checkOutVisitor(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelVisitorService(req.tenantId as any);
      const data = await svc.checkOutVisitor(req.params.id as string);
      sendResponse({ res, message: 'Visitor checked out', data });
    } catch (err) { next(err); }
  }

  // --- MESS ---
  static async getMealPlans(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new MessService(req.tenantId as any);
      const data = await svc.getMealPlans(req.query.hostelId as string, req.query.startDate as string, req.query.endDate as string);
      sendResponse({ res, message: 'Meal plans fetched', data });
    } catch (err) { next(err); }
  }

  static async createMealPlan(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new MessService(req.tenantId as any);
      const data = await svc.createMealPlan(req.body);
      sendResponse({ res, status: 201, message: 'Meal plan created', data });
    } catch (err) { next(err); }
  }

  static async updateMealPlan(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new MessService(req.tenantId as any);
      const data = await svc.updateMealPlan(req.params.id as string, req.body);
      sendResponse({ res, message: 'Meal plan updated', data });
    } catch (err) { next(err); }
  }

  static async deleteMealPlan(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new MessService(req.tenantId as any);
      const data = await svc.deleteMealPlan(req.params.id as string);
      sendResponse({ res, message: 'Meal plan deleted', data });
    } catch (err) { next(err); }
  }

  static async getMessFeedback(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new MessService(req.tenantId as any);
      const data = await svc.getFeedback(req.query.hostelId as string, req.query.mealPlanId as string);
      sendResponse({ res, message: 'Mess feedback fetched', data });
    } catch (err) { next(err); }
  }

  static async submitMessFeedback(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new MessService(req.tenantId as any);
      const data = await svc.submitFeedback({ ...req.body, studentId: req.body.studentId || req.user?._id });
      sendResponse({ res, status: 201, message: 'Mess feedback submitted', data });
    } catch (err) { next(err); }
  }

  static async updateOutpassStatus(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelOperationsService(req.tenantId as any);
      const data = await svc.updateOutpassStatus(req.params.id as string, req.body.status);
      sendResponse({ res, message: 'Outpass status updated', data });
    } catch (err) { next(err); }
  }

  static async getIncidents(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelComplaintService(req.tenantId as any);
      const data = await svc.getIncidents(req.query.hostelId as string);
      sendResponse({ res, message: 'Incidents fetched', data });
    } catch (err) { next(err); }
  }

  static async createIncident(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const svc = new HostelComplaintService(req.tenantId as any);
      const data = await svc.createIncident({ ...req.body, reportedByUserId: req.user?._id });
      sendResponse({ res, status: 201, message: 'Incident reported successfully', data });
    } catch (err) { next(err); }
  }
}
