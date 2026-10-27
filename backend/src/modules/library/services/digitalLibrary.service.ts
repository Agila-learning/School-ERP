import mongoose from 'mongoose';
import DigitalResource from '../models/DigitalResource.model';
import DigitalResourceAccessLog from '../models/DigitalResourceAccessLog.model';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../core/errors/AppError';

export class DigitalLibraryService {
  private tenantId: string;
  constructor(tenantId: string) { this.tenantId = tenantId; }
  private get tid() { return new mongoose.Types.ObjectId(this.tenantId); }

  async getResources(filters: {
    categoryId?: string;
    resourceType?: string;
    search?: string;
    status?: string;
  } = {}) {
    const query: any = { tenantId: this.tid, isDeleted: { $ne: true } };
    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = 'ACTIVE';
    }
    if (filters.categoryId) query.categoryId = new mongoose.Types.ObjectId(filters.categoryId);
    if (filters.resourceType) query.resourceType = filters.resourceType;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { author: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return DigitalResource.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });
  }

  async getResourceById(resourceId: string) {
    const resource = await DigitalResource.findOne({ _id: resourceId, tenantId: this.tid });
    if (!resource) throw new NotFoundError('Digital resource not found.');
    return resource;
  }

  async createResource(data: any, createdBy: string) {
    return DigitalResource.create({ ...data, tenantId: this.tid });
  }

  async updateResource(resourceId: string, data: any) {
    const resource = await DigitalResource.findOneAndUpdate(
      { _id: resourceId, tenantId: this.tid },
      { $set: data },
      { new: true }
    );
    if (!resource) throw new NotFoundError('Digital resource not found.');
    return resource;
  }

  async deleteResource(resourceId: string) {
    const resource = await DigitalResource.findOne({ _id: resourceId, tenantId: this.tid });
    if (!resource) throw new NotFoundError('Digital resource not found.');
    resource.isDeleted = true;
    await resource.save();
  }

  /**
   * Access gate: checks if the user is allowed to view/download a resource
   * and records access in the log.
   */
  async accessResource(
    resourceId: string,
    userId: string,
    userRole: string,
    accessType: 'VIEW' | 'DOWNLOAD',
    meta: { ipAddress?: string; userAgent?: string } = {}
  ) {
    const resource = await DigitalResource.findOne({
      _id: resourceId,
      tenantId: this.tid,
      status: 'ACTIVE',
      isDeleted: { $ne: true }
    });
    if (!resource) throw new NotFoundError('Digital resource not found or not available.');

    // Check license expiry
    if (resource.licenseExpiry && new Date(resource.licenseExpiry) < new Date()) {
      throw new ForbiddenError('This resource license has expired.');
    }

    // Check access restrictions
    const restriction = resource.accessRestrictions;
    let allowed = false;
    if (restriction === 'PUBLIC') {
      allowed = true;
    } else if (restriction === 'STUDENT_ONLY' && userRole === 'STUDENT') {
      allowed = true;
    } else if (restriction === 'TEACHER_ONLY' && userRole === 'TEACHER') {
      allowed = true;
    } else if (restriction === 'STAFF_ONLY' && ['TEACHER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      allowed = true;
    } else if (restriction === 'CLASS_SPECIFIC') {
      // Note: in a full implementation, we'd check if user's class is in allowedClassIds
      // For now, allow teachers and admins always; students would need class check
      allowed = ['TEACHER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(userRole);
    }

    if (!allowed) {
      throw new ForbiddenError('You do not have permission to access this resource.');
    }

    // Log the access
    await DigitalResourceAccessLog.create({
      tenantId: this.tid,
      resourceId: resource._id,
      userId: new mongoose.Types.ObjectId(userId),
      accessType,
      accessedAt: new Date(),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { resource, url: resource.url };
  }

  async getAccessStats(resourceId: string) {
    const stats = await DigitalResourceAccessLog.aggregate([
      { $match: { tenantId: this.tid, resourceId: new mongoose.Types.ObjectId(resourceId) } },
      { $group: { _id: '$accessType', count: { $sum: 1 } } }
    ]);
    const result: Record<string, number> = { VIEW: 0, DOWNLOAD: 0 };
    stats.forEach((s: any) => result[s._id] = s.count);
    return result;
  }

  async getMostAccessedResources(limit = 10) {
    return DigitalResourceAccessLog.aggregate([
      { $match: { tenantId: this.tid } },
      { $group: { _id: '$resourceId', totalAccess: { $sum: 1 } } },
      { $sort: { totalAccess: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'digitalresources',
          localField: '_id',
          foreignField: '_id',
          as: 'resource'
        }
      },
      { $unwind: '$resource' },
      { $project: { _id: 0, resource: 1, totalAccess: 1 } }
    ]);
  }
}
