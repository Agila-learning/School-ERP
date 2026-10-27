import mongoose from 'mongoose';
import Employee from '../models/Employee.model';
import Department from '../models/Department.model';
import Designation from '../models/Designation.model';
import JobRequisition from '../models/JobRequisition.model';
import Candidate from '../models/Candidate.model';
import { Resignation, ExitClearance, FinalSettlement } from '../models/Exit.model';
import { NotFoundError } from '../../../core/errors/AppError';
import LeaveRequest from '../../attendance/models/LeaveRequest.model';

export class HRService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getDepartments() {
    return Department.find({ tenantId: this.tid, isActive: { $ne: false }, isDeleted: { $ne: true } });
  }

  async createDepartment(data: any) {
    return Department.create({ ...data, tenantId: this.tid });
  }

  async updateDepartment(id: string, data: any) {
    const dept = await Department.findOneAndUpdate(
      { _id: id, tenantId: this.tid },
      data,
      { new: true, runValidators: true }
    );
    if (!dept) throw new NotFoundError('Department not found');
    return dept;
  }

  async deactivateDepartment(id: string) {
    const dept = await Department.findOneAndUpdate(
      { _id: id, tenantId: this.tid },
      { isActive: false, isDeleted: true },
      { new: true }
    );
    if (!dept) throw new NotFoundError('Department not found');
    return dept;
  }

  async getDesignations(departmentId?: string) {
    const filter: any = { tenantId: this.tid, isActive: { $ne: false }, isDeleted: { $ne: true } };
    if (departmentId) filter.departmentId = new mongoose.Types.ObjectId(departmentId);
    return Designation.find(filter).populate('departmentId', 'name');
  }

  async createDesignation(data: any) {
    return Designation.create({ ...data, tenantId: this.tid });
  }

  async updateDesignation(id: string, data: any) {
    const des = await Designation.findOneAndUpdate(
      { _id: id, tenantId: this.tid },
      data,
      { new: true, runValidators: true }
    );
    if (!des) throw new NotFoundError('Designation not found');
    return des;
  }

  async deactivateDesignation(id: string) {
    const des = await Designation.findOneAndUpdate(
      { _id: id, tenantId: this.tid },
      { isActive: false, isDeleted: true },
      { new: true }
    );
    if (!des) throw new NotFoundError('Designation not found');
    return des;
  }

  async getEmployees(branchId?: string, departmentId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (branchId) filter.branchId = new mongoose.Types.ObjectId(branchId);
    if (departmentId) filter.departmentId = new mongoose.Types.ObjectId(departmentId);
    
    return Employee.find(filter)
      .populate('departmentId', 'name')
      .populate('designationId', 'name')
      .populate('reportingManagerId', 'firstName lastName');
  }

  async getEmployeeProfile(employeeId: string) {
    const emp = await Employee.findOne({ _id: employeeId, tenantId: this.tid })
      .populate('departmentId', 'name')
      .populate('designationId', 'name')
      .populate('reportingManagerId', 'firstName lastName');
    if (!emp) throw new NotFoundError('Employee not found');
    return emp;
  }

  async getDashboardStats() {
    const totalEmployees = await Employee.countDocuments({ tenantId: this.tid, isDeleted: { $ne: true } });
    const activeEmployees = await Employee.countDocuments({ tenantId: this.tid, status: 'ACTIVE' });
    const newJoiners = await Employee.countDocuments({ 
      tenantId: this.tid, 
      joiningDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
    });
    
    // Fallback safely if models don't exist yet or are empty
    let openRequisitions = 0, activeCandidates = 0, pendingExits = 0, onLeaveToday = 0;
    try { openRequisitions = await JobRequisition.countDocuments({ tenantId: this.tid, status: 'OPEN' }); } catch(e) {}
    try { activeCandidates = await Candidate.countDocuments({ tenantId: this.tid, status: { $in: ['APPLIED', 'INTERVIEWING', 'OFFERED'] } }); } catch(e) {}
    try { pendingExits = await Resignation.countDocuments({ tenantId: this.tid, status: 'PENDING_APPROVAL' }); } catch(e) {}
    
    try { 
      const today = new Date();
      onLeaveToday = await LeaveRequest.countDocuments({ 
        tenantId: this.tid, 
        status: 'APPROVED',
        startDate: { $lte: today },
        endDate: { $gte: today }
      }); 
    } catch(e) {}

    const depts = await Department.find({ tenantId: this.tid });
    const departmentDistribution = await Promise.all(depts.map(async (d: any) => {
      const count = await Employee.countDocuments({ tenantId: this.tid, departmentId: d._id, status: 'ACTIVE' });
      return { name: (d as any).name, count, color: 'bg-indigo-500' };
    }));

    return {
      totalEmployees,
      activeEmployees,
      newJoiners,
      openRequisitions,
      activeCandidates,
      onLeaveToday,
      pendingExits,
      departmentDistribution: departmentDistribution.filter(d => d.count > 0)
    };
  }
}
