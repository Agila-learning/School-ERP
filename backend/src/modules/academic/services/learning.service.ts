import mongoose from 'mongoose';
import OnlineClass from '../models/OnlineClass.model';
import Project from '../models/Project.model';
import SpecialClass from '../models/SpecialClass.model';
import Assessment from '../models/Assessment.model';
import LabExperiment from '../models/LabExperiment.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class LearningService {
  constructor(private tid: string) {}

  // Online Classes
  async createOnlineClass(teacherId: string, data: any) {
    const Class = require('../models/Class.model').default;
    const Subject = require('../models/Subject.model').default;

    let classId = data.classId;
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      if (data.class) {
        const found = await Class.findOne({ tenantId: this.tid, name: new RegExp(`^${data.class.trim()}$`, 'i') });
        if (found) classId = found._id;
      }
      if (!classId) {
        const anyClass = await Class.findOne({ tenantId: this.tid });
        if (anyClass) classId = anyClass._id;
      }
    }

    let subjectId = data.subjectId;
    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      if (data.subject) {
        const found = await Subject.findOne({ tenantId: this.tid, name: new RegExp(`^${data.subject.trim()}$`, 'i') });
        if (found) subjectId = found._id;
      }
      if (!subjectId) {
        const anySub = await Subject.findOne({ tenantId: this.tid });
        if (anySub) subjectId = anySub._id;
      }
    }

    const platformMap: Record<string, string> = {
      'Zoom': 'ZOOM',
      'Google Meet': 'MEET',
      'Microsoft Teams': 'TEAMS',
      'Internal': 'OTHER'
    };
    const platform = platformMap[data.platform] || (['ZOOM', 'MEET', 'TEAMS', 'OTHER'].includes(data.platform?.toUpperCase()) ? data.platform.toUpperCase() : 'MEET');

    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : new Date(Date.now() + 3600000);
    const durationMinutes = Number(data.duration || data.durationMinutes || 60);

    let tId = mongoose.Types.ObjectId.isValid(teacherId) ? new mongoose.Types.ObjectId(teacherId) : null;
    if (!tId) {
      const User = require('../../auth/models/User.model').default;
      const u = await User.findOne({ tenantId: this.tid });
      tId = u ? u._id : new mongoose.Types.ObjectId();
    }

    return OnlineClass.create({
      tenantId: this.tid,
      title: data.title || 'Online Session',
      description: data.description || '',
      classId,
      subjectId,
      teacherId: tId,
      platform,
      meetingLink: data.meetingLink || 'https://meet.google.com',
      scheduledAt,
      durationMinutes,
      status: data.status || 'SCHEDULED'
    });
  }

  async getOnlineClasses(filter: any = {}) {
    const list = await OnlineClass.find({ tenantId: this.tid, ...filter })
      .populate('classId', 'name code')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName')
      .sort({ scheduledAt: 1 });

    const platformDisplayMap: Record<string, string> = {
      'ZOOM': 'Zoom',
      'MEET': 'Google Meet',
      'TEAMS': 'Microsoft Teams',
      'OTHER': 'Internal'
    };

    return list.map((c: any) => ({
      _id: c._id.toString(),
      id: c._id.toString(),
      title: c.title,
      description: c.description,
      subject: c.subjectId?.name || 'General',
      class: c.classId?.name || 'All Grades',
      teacher: c.teacherId ? `${c.teacherId.firstName || ''} ${c.teacherId.lastName || ''}`.trim() : 'Staff Instructor',
      scheduledAt: c.scheduledAt ? c.scheduledAt.toISOString() : new Date().toISOString(),
      duration: c.durationMinutes || 60,
      durationMinutes: c.durationMinutes || 60,
      platform: platformDisplayMap[c.platform] || c.platform || 'Zoom',
      meetingLink: c.meetingLink,
      status: c.status || 'SCHEDULED',
      attendees: 0,
      capacity: 50
    }));
  }

  async updateOnlineClass(id: string, data: any) {
    const updated = await OnlineClass.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!updated) throw new NotFoundError('Online Class not found');
    return updated;
  }

  async deleteOnlineClass(id: string) {
    const deleted = await OnlineClass.findOneAndDelete({ _id: id, tenantId: this.tid });
    if (!deleted) throw new NotFoundError('Online Class not found');
    return deleted;
  }

  // Projects
  async createProject(teacherId: string, data: any) {
    return Project.create({
      ...data,
      tenantId: this.tid,
      teacherId: new mongoose.Types.ObjectId(teacherId)
    });
  }

  async getProjects(filter: any = {}) {
    return Project.find({ tenantId: this.tid, ...filter })
      .populate('classId', 'name')
      .populate('subjectId', 'name')
      .populate('teacherId', 'firstName lastName')
      .sort({ dueDate: 1 });
  }

  async updateProject(id: string, data: any) {
    const updated = await Project.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!updated) throw new NotFoundError('Project not found');
    return updated;
  }

  async deleteProject(id: string) {
    const deleted = await Project.findOneAndDelete({ _id: id, tenantId: this.tid });
    if (!deleted) throw new NotFoundError('Project not found');
    return deleted;
  }

  // Special Classes
  async createSpecialClass(data: any) {
    let objectives = data.objectives;
    if (typeof objectives === 'string') {
      objectives = objectives.split('\n').map((s: string) => s.trim()).filter(Boolean);
    } else if (!Array.isArray(objectives)) {
      objectives = [];
    }

    const payload = {
      ...data,
      tenantId: this.tid,
      objectives,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : new Date(),
      duration: Number(data.duration || 60),
      maxSeats: Number(data.maxSeats || 30),
      enrolled: Number(data.enrolled || 0),
      status: data.status || 'UPCOMING'
    };

    return SpecialClass.create(payload);
  }

  async getSpecialClasses(filter: any = {}) {
    return SpecialClass.find({ tenantId: this.tid, ...filter }).sort({ scheduledAt: 1 });
  }

  async updateSpecialClass(id: string, data: any) {
    const updated = await SpecialClass.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!updated) throw new NotFoundError('Special Class not found');
    return updated;
  }

  async deleteSpecialClass(id: string) {
    const deleted = await SpecialClass.findOneAndDelete({ _id: id, tenantId: this.tid });
    if (!deleted) throw new NotFoundError('Special Class not found');
    return deleted;
  }

  // Assessments
  async createAssessment(data: any) {
    const rawType = (data.type || 'QUIZ').toString().toUpperCase().replace(/[\s-]/g, '_');
    const validTypes = ['UNIT_TEST', 'QUIZ', 'ASSIGNMENT', 'PRACTICAL', 'PROJECT', 'ORAL'];
    const type = validTypes.includes(rawType) ? rawType : 'QUIZ';

    const deadline = data.deadline ? new Date(data.deadline) : undefined;
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : (deadline || new Date());

    const payload = {
      ...data,
      tenantId: this.tid,
      type,
      subject: data.subject || 'General',
      class: data.class || 'All Grades',
      totalMarks: Number(data.totalMarks || 100),
      duration: data.duration ? Number(data.duration) : 60,
      scheduledAt,
      deadline,
      status: (data.status || 'DRAFT').toUpperCase(),
      totalStudents: Number(data.totalStudents || 35),
      submittedCount: Number(data.submittedCount || 0)
    };

    return Assessment.create(payload);
  }

  async getAssessments(filter: any = {}) {
    return Assessment.find({ tenantId: this.tid, ...filter }).sort({ scheduledAt: 1, deadline: 1 });
  }

  async updateAssessment(id: string, data: any) {
    const updated = await Assessment.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!updated) throw new NotFoundError('Assessment not found');
    return updated;
  }

  async deleteAssessment(id: string) {
    const deleted = await Assessment.findOneAndDelete({ _id: id, tenantId: this.tid });
    if (!deleted) throw new NotFoundError('Assessment not found');
    return deleted;
  }

  // Lab Experiments
  async createLabExperiment(data: any) {
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : new Date();
    const apparatus = Array.isArray(data.apparatus) 
      ? data.apparatus 
      : (typeof data.apparatus === 'string' ? data.apparatus.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
    
    const safetyPrecautions = Array.isArray(data.safetyPrecautions)
      ? data.safetyPrecautions
      : (typeof data.safetyPrecautions === 'string' ? data.safetyPrecautions.split('\n').map((s: string) => s.trim()).filter(Boolean) : []);

    const payload = {
      ...data,
      tenantId: this.tid,
      title: data.title || 'Untitled Lab Experiment',
      experimentNo: data.experimentNo || `EXP-${Math.floor(100 + Math.random() * 900)}`,
      subject: data.subject || 'Chemistry',
      chapter: data.chapter || 'Unit 1 Practical',
      class: data.class || 'Grade 10',
      teacher: data.teacher || 'Lab Instructor',
      labRoom: data.labRoom || 'Science Lab 1',
      scheduledAt,
      duration: Number(data.duration || 90),
      status: (data.status || 'UPCOMING').toUpperCase(),
      aim: data.aim || data.title || 'Conduct standard lab demonstration and practical analysis',
      apparatus,
      safetyPrecautions: safetyPrecautions.length > 0 ? safetyPrecautions : ['Wear lab coat and safety goggles'],
      totalStudents: Number(data.totalStudents || 30),
      completedStudents: Number(data.completedStudents || 0)
    };

    return LabExperiment.create(payload);
  }

  async getLabExperiments(filter: any = {}) {
    return LabExperiment.find({ tenantId: this.tid, ...filter }).sort({ scheduledAt: 1 });
  }

  async updateLabExperiment(id: string, data: any) {
    const updated = await LabExperiment.findOneAndUpdate({ _id: id, tenantId: this.tid }, data, { new: true });
    if (!updated) throw new NotFoundError('Lab Experiment not found');
    return updated;
  }

  async deleteLabExperiment(id: string) {
    const deleted = await LabExperiment.findOneAndDelete({ _id: id, tenantId: this.tid });
    if (!deleted) throw new NotFoundError('Lab Experiment not found');
    return deleted;
  }
}
