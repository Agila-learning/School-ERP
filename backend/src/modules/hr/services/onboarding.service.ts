import mongoose from 'mongoose';
import OnboardingTask from '../models/OnboardingTask.model';
import Employee from '../models/Employee.model';

export class OnboardingService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getTasks(employeeId?: string) {
    const filter: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (employeeId) filter.employeeId = new mongoose.Types.ObjectId(employeeId);
    
    return OnboardingTask.find(filter)
      .populate('employeeId', 'firstName lastName employeeIdNumber')
      .populate('assignedToRoleId', 'name')
      .populate('assignedToEmployeeId', 'firstName lastName')
      .sort({ dueDate: 1 });
  }

  async createTasksForEmployee(employeeId: string, tasks: any[]) {
    const employee = await Employee.findOne({ _id: employeeId, tenantId: this.tid });
    if (!employee) throw new Error('Employee not found');

    const createdTasks = [];
    for (const task of tasks) {
      const created = await OnboardingTask.create({
        ...task,
        employeeId: employee._id,
        tenantId: this.tid,
        status: 'PENDING'
      });
      createdTasks.push(created);
    }
    return createdTasks;
  }

  async updateTaskStatus(taskId: string, status: string, remarks?: string, completedBy?: string) {
    const updateData: any = { status };
    if (remarks) updateData.remarks = remarks;
    if (status === 'COMPLETED') {
      updateData.completedDate = new Date();
      if (completedBy) updateData.assignedToEmployeeId = new mongoose.Types.ObjectId(completedBy);
    }

    const task = await OnboardingTask.findOneAndUpdate(
      { _id: taskId, tenantId: this.tid, isDeleted: { $ne: true } },
      updateData,
      { new: true }
    );
    if (!task) throw new Error('Task not found');
    return task;
  }

  async deleteTasksForEmployee(employeeId: string) {
    await OnboardingTask.updateMany(
      { employeeId: new mongoose.Types.ObjectId(employeeId), tenantId: this.tid },
      { isDeleted: true, deletedAt: new Date() }
    );
  }
}
