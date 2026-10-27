import { AlumniConnection, AlumniGroup, AlumniGroupMember } from '../models/AlumniNetworking.model';

export class AlumniNetworkingService {
  async sendConnectionRequest(tenantId: string, requesterId: string, targetId: string) {
    const existing = await AlumniConnection.findOne({
      tenantId,
      $or: [
        { requesterId, targetId },
        { requesterId: targetId, targetId: requesterId }
      ]
    });

    if (existing) throw new Error('Connection request already exists');

    const request = new AlumniConnection({
      tenantId,
      requesterId,
      targetId,
      status: 'Pending'
    });

    return await request.save();
  }

  async respondToConnection(tenantId: string, connectionId: string, status: 'Accepted' | 'Rejected' | 'Blocked') {
    return await AlumniConnection.findOneAndUpdate(
      { _id: connectionId, tenantId },
      { status, dateResponded: new Date() },
      { new: true }
    );
  }

  async createGroup(tenantId: string, data: any) {
    const group = new AlumniGroup({ ...data, tenantId });
    await group.save();

    const member = new AlumniGroupMember({
      tenantId,
      groupId: group._id,
      alumniProfileId: data.createdBy,
      role: 'Admin'
    });
    await member.save();

    return group;
  }

  async joinGroup(tenantId: string, groupId: string, alumniProfileId: string) {
    const existing = await AlumniGroupMember.findOne({ tenantId, groupId, alumniProfileId });
    if (existing) throw new Error('Already a member of this group');

    const member = new AlumniGroupMember({ tenantId, groupId, alumniProfileId });
    await member.save();

    await AlumniGroup.findByIdAndUpdate(groupId, { $inc: { memberCount: 1 } });
    return member;
  }
}

export const alumniNetworkingService = new AlumniNetworkingService();
