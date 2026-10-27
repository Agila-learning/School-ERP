import { Task } from '../models/TaskEngine.model';

export class TaskService {
  async createTask(tenantId: string, data: any) {
    const task = new Task({
      ...data,
      tenantId,
      status: 'Assigned'
    });
    return await task.save();
  }

  async updateStatus(tenantId: string, taskId: string, newStatus: string) {
    const update: any = { status: newStatus };
    if (newStatus === 'Completed') {
      update.completedDate = new Date();
    }
    
    return await Task.findOneAndUpdate(
      { _id: taskId, tenantId },
      { $set: update },
      { new: true }
    );
  }

  async addComment(tenantId: string, taskId: string, userId: string, text: string, isInternal: boolean) {
    return await Task.findOneAndUpdate(
      { _id: taskId, tenantId },
      { $push: { comments: { userId, text, isInternal, createdAt: new Date() } } },
      { new: true }
    );
  }
}

export const taskService = new TaskService();
