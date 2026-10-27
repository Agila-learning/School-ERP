import mongoose from 'mongoose';
import { SportsTeam } from '../models/SportsTeam.model';
import { SportsEvent } from '../models/SportsEvent.model';
import { SportsEquipment } from '../models/SportsEquipment.model';
import { PracticeSession } from '../models/PracticeSession.model';
import { NotFoundError } from '../../../core/errors/AppError';

export class SportsService {
  private tid: any;
  private tidFilter: any;

  constructor(tenantId: string | any) {
    this.tid = tenantId;
    this.tidFilter = {
      $in: [
        this.tid,
        ...(mongoose.Types.ObjectId.isValid(this.tid) ? [new mongoose.Types.ObjectId(this.tid)] : [])
      ]
    };
  }

  private toIdOrVal(val: any) {
    if (!val) return val;
    return mongoose.Types.ObjectId.isValid(val) ? new mongoose.Types.ObjectId(val) : val;
  }

  async ensureSeedData() {
    try {
      const existing = await SportsTeam.countDocuments({
        tenantId: this.tidFilter,
        isDeleted: { $ne: true }
      });
      if (existing > 0) return;

      const teams = await SportsTeam.create([
        {
          tenantId: this.tid,
          name: 'FIC Lions Football Club',
          sportType: 'FOOTBALL',
          category: 'Under-17 Boys',
          coachName: 'Coach Devendra Negi',
          captainName: 'Aarav Sharma (Grade 10)',
          membersCount: 18,
          achievements: 'State Inter-School Runners Up 2025',
          status: 'ACTIVE'
        },
        {
          tenantId: this.tid,
          name: 'FIC Titans Cricket XI',
          sportType: 'CRICKET',
          category: 'Senior Boys',
          coachName: 'Coach Sanjeev Malhotra',
          captainName: 'Rohan Mehra (Grade 12)',
          membersCount: 16,
          achievements: 'District Championship Winners 2025',
          status: 'ACTIVE'
        },
        {
          tenantId: this.tid,
          name: 'FIC Hawks Basketball Squad',
          sportType: 'BASKETBALL',
          category: 'Under-19 Girls',
          coachName: 'Coach Neha Deshmukh',
          captainName: 'Ananya Verma (Grade 11)',
          membersCount: 12,
          achievements: 'Zone Champions 2024 & 2025',
          status: 'ACTIVE'
        },
        {
          tenantId: this.tid,
          name: 'FIC Cheetahs Track & Field',
          sportType: 'ATHLETICS',
          category: 'Mixed Senior',
          coachName: 'Coach R. Balakrishnan',
          captainName: 'Kabir Patel (Grade 11)',
          membersCount: 24,
          achievements: '14 Gold Medals at Regional Meet',
          status: 'ACTIVE'
        },
        {
          tenantId: this.tid,
          name: 'FIC Falcons Badminton Club',
          sportType: 'BADMINTON',
          category: 'Junior & Senior',
          coachName: 'Coach Priya Shenoy',
          captainName: 'Sneha Kulkarni (Grade 9)',
          membersCount: 10,
          achievements: 'CBSE Cluster Silver Medallists',
          status: 'ACTIVE'
        }
      ]);

      await SportsEvent.create([
        {
          tenantId: this.tid,
          title: '34th Annual Inter-School Athletics Championship',
          sportType: 'ATHLETICS',
          eventType: 'INTER_SCHOOL',
          venue: 'FIC Olympic Athletics Stadium',
          startDate: new Date(Date.now() + 5 * 86400000),
          endDate: new Date(Date.now() + 7 * 86400000),
          description: 'Premier regional track, field and relay events featuring 18 visiting academies.',
          participatingTeams: '18 Schools Across Northern Zone',
          coordinatorName: 'Coach R. Balakrishnan',
          status: 'UPCOMING'
        },
        {
          tenantId: this.tid,
          title: 'FIC Invitational Regional Football Trophy',
          sportType: 'FOOTBALL',
          eventType: 'INTER_SCHOOL',
          venue: 'Main Football Turf Ground',
          startDate: new Date(Date.now() + 12 * 86400000),
          endDate: new Date(Date.now() + 14 * 86400000),
          description: 'Quarter-final and semi-final knockout matches for the U-17 Football Cup.',
          participatingTeams: 'FIC Lions, Modern School, St. Columba XI, DPS Blue',
          coordinatorName: 'Coach Devendra Negi',
          status: 'UPCOMING'
        },
        {
          tenantId: this.tid,
          title: 'Inter-House Basketball League Finals',
          sportType: 'BASKETBALL',
          eventType: 'INTRA_SCHOOL',
          venue: 'Indoor Wooden Sports Complex - Court 1',
          startDate: new Date(Date.now() - 2 * 86400000),
          endDate: new Date(Date.now() - 1 * 86400000),
          description: 'Grand finals between Red House Phoenix and Blue House Titans.',
          participatingTeams: 'Phoenix vs Titans',
          coordinatorName: 'Coach Neha Deshmukh',
          status: 'COMPLETED',
          results: 'Phoenix House won 68 - 62 in Overtime'
        }
      ]);

      await SportsEquipment.create([
        {
          tenantId: this.tid,
          itemCode: 'EQ-FB-01',
          name: 'FIFA Quality Pro Match Footballs (Size 5)',
          sportCategory: 'FOOTBALL',
          quantity: 25,
          availableQuantity: 20,
          condition: 'EXCELLENT',
          location: 'Main Sports Pavilion Locker A',
          status: 'AVAILABLE'
        },
        {
          tenantId: this.tid,
          itemCode: 'EQ-CR-01',
          name: 'SS Professional English Willow Match Bats & Protective Gear',
          sportCategory: 'CRICKET',
          quantity: 12,
          availableQuantity: 10,
          condition: 'GOOD',
          location: 'Cricket Equipment Shed',
          status: 'AVAILABLE'
        },
        {
          tenantId: this.tid,
          itemCode: 'EQ-BB-01',
          name: 'Spalding TF-1000 Indoor Composite Basketballs',
          sportCategory: 'BASKETBALL',
          quantity: 20,
          availableQuantity: 18,
          condition: 'EXCELLENT',
          location: 'Indoor Gymnasium Storage Cage 2',
          status: 'AVAILABLE'
        },
        {
          tenantId: this.tid,
          itemCode: 'EQ-BM-01',
          name: 'Yonex Nanoflare 800 Pro Rackets & Feather Shuttle Tubes',
          sportCategory: 'BADMINTON',
          quantity: 16,
          availableQuantity: 14,
          condition: 'GOOD',
          location: 'Badminton Court Locker 3',
          status: 'AVAILABLE'
        },
        {
          tenantId: this.tid,
          itemCode: 'EQ-AT-01',
          name: 'IAAF Certified High Jump Landing Foam Mattresses & Poles',
          sportCategory: 'ATHLETICS',
          quantity: 2,
          availableQuantity: 2,
          condition: 'EXCELLENT',
          location: 'Field Storage Bay West',
          status: 'AVAILABLE'
        }
      ]);

      await PracticeSession.create([
        {
          tenantId: this.tid,
          title: 'U-17 Tactical Set Pieces & Penalty Shootout Drills',
          sportType: 'FOOTBALL',
          teamName: 'FIC Lions Football Club',
          teamId: teams[0]?._id,
          coachName: 'Coach Devendra Negi',
          venue: 'Main Football Turf Ground',
          sessionDate: new Date(Date.now() + 86400000),
          startTime: '06:30 AM',
          endTime: '08:00 AM',
          drillsFocus: 'Corner kicks defending, 4-3-3 counter-pressing transition, spot kicks',
          attendanceCount: 18,
          status: 'SCHEDULED'
        },
        {
          tenantId: this.tid,
          title: 'Cricket Pace Bowling & Fielding Alignment in Nets',
          sportType: 'CRICKET',
          teamName: 'FIC Titans Cricket XI',
          teamId: teams[1]?._id,
          coachName: 'Coach Sanjeev Malhotra',
          venue: 'Turf Cricket Nets 1 & 2',
          sessionDate: new Date(Date.now() + 86400000),
          startTime: '04:00 PM',
          endTime: '06:00 PM',
          drillsFocus: 'Length control on seam, slip catching drills, death overs bowling',
          attendanceCount: 15,
          status: 'SCHEDULED'
        },
        {
          tenantId: this.tid,
          title: 'Girls Basketball Fast Break & Zone Defense Clinic',
          sportType: 'BASKETBALL',
          teamName: 'FIC Hawks Basketball Squad',
          teamId: teams[2]?._id,
          coachName: 'Coach Neha Deshmukh',
          venue: 'Indoor Sports Complex - Court 1',
          sessionDate: new Date(Date.now() + 2 * 86400000),
          startTime: '07:00 AM',
          endTime: '08:30 AM',
          drillsFocus: '3-point shooting efficiency, full-court press escape, box-and-one defense',
          attendanceCount: 12,
          status: 'SCHEDULED'
        }
      ]);
    } catch (e) {
      console.warn('Sports auto-seed notice:', e);
    }
  }

  // --- Dashboard Stats ---
  async getDashboardStats() {
    await this.ensureSeedData();
    const [
      totalTeams,
      activeTeams,
      upcomingEvents,
      totalEvents,
      equipmentTypes,
      equipmentItems,
      scheduledSessions
    ] = await Promise.all([
      SportsTeam.countDocuments({ tenantId: this.tidFilter, isDeleted: { $ne: true } }),
      SportsTeam.countDocuments({ tenantId: this.tidFilter, status: 'ACTIVE', isDeleted: { $ne: true } }),
      SportsEvent.countDocuments({ tenantId: this.tidFilter, status: { $in: ['UPCOMING', 'ONGOING'] }, isDeleted: { $ne: true } }),
      SportsEvent.countDocuments({ tenantId: this.tidFilter, isDeleted: { $ne: true } }),
      SportsEquipment.countDocuments({ tenantId: this.tidFilter, isDeleted: { $ne: true } }),
      SportsEquipment.aggregate([
        { $match: { tenantId: this.tidFilter, isDeleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: '$quantity' }, available: { $sum: '$availableQuantity' } } }
      ]),
      PracticeSession.countDocuments({ tenantId: this.tidFilter, status: 'SCHEDULED', isDeleted: { $ne: true } })
    ]);

    const athletesSum = await SportsTeam.aggregate([
      { $match: { tenantId: this.tidFilter, isDeleted: { $ne: true } } },
      { $group: { _id: null, totalAthletes: { $sum: '$membersCount' } } }
    ]);

    return {
      totalTeams,
      activeTeams,
      totalAthletes: athletesSum[0]?.totalAthletes || 0,
      upcomingEvents,
      totalEvents,
      equipmentTypes,
      totalEquipmentUnits: equipmentItems[0]?.total || 0,
      availableEquipmentUnits: equipmentItems[0]?.available || 0,
      scheduledSessions
    };
  }

  // --- Sports Team CRUD ---
  async getTeams(sportType?: string) {
    await this.ensureSeedData();
    const query: any = { tenantId: this.tidFilter, isDeleted: { $ne: true } };
    if (sportType && sportType !== 'ALL') query.sportType = sportType;
    return await SportsTeam.find(query).sort({ createdAt: -1 }).lean();
  }

  async createTeam(data: any) {
    const payload = { ...data, tenantId: this.tid };
    delete payload.id;
    delete payload._id;
    if (!payload.sportType) payload.sportType = 'FOOTBALL';
    else payload.sportType = String(payload.sportType).toUpperCase();
    if (payload.membersCount !== undefined) payload.membersCount = Number(payload.membersCount) || 0;
    if (!payload.status) payload.status = 'ACTIVE';
    if (!payload.category) payload.category = 'General';
    return await SportsTeam.create(payload);
  }

  async updateTeam(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    delete payload._id;
    if (payload.membersCount !== undefined) payload.membersCount = Number(payload.membersCount);
    const team = await SportsTeam.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    );
    if (!team) throw new NotFoundError('Sports team not found');
    return team;
  }

  async deleteTeam(id: string) {
    const team = await SportsTeam.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!team) throw new NotFoundError('Sports team not found');
    return team;
  }

  // --- Sports Event CRUD ---
  async getEvents(sportType?: string) {
    await this.ensureSeedData();
    const query: any = { tenantId: this.tidFilter, isDeleted: { $ne: true } };
    if (sportType && sportType !== 'ALL') query.sportType = sportType;
    return await SportsEvent.find(query).sort({ startDate: 1 }).lean();
  }

  async createEvent(data: any) {
    const payload = { ...data, tenantId: this.tid };
    delete payload.id;
    delete payload._id;
    if (!payload.sportType) payload.sportType = 'FOOTBALL';
    else payload.sportType = String(payload.sportType).toUpperCase();
    if (!payload.status) payload.status = 'UPCOMING';
    if (payload.startDate) payload.startDate = new Date(payload.startDate);
    return await SportsEvent.create(payload);
  }

  async updateEvent(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    delete payload._id;
    const event = await SportsEvent.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    );
    if (!event) throw new NotFoundError('Sports event not found');
    return event;
  }

  async deleteEvent(id: string) {
    const event = await SportsEvent.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!event) throw new NotFoundError('Sports event not found');
    return event;
  }

  // --- Sports Equipment CRUD ---
  async getEquipment(sportCategory?: string) {
    await this.ensureSeedData();
    const query: any = { tenantId: this.tidFilter, isDeleted: { $ne: true } };
    if (sportCategory && sportCategory !== 'ALL') query.sportCategory = sportCategory;
    return await SportsEquipment.find(query).sort({ createdAt: -1 }).lean();
  }

  async createEquipment(data: any) {
    const payload = { ...data, tenantId: this.tid };
    delete payload.id;
    delete payload._id;
    if (!payload.itemCode) {
      payload.itemCode = 'EQ-SP-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
    if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity);
    if (payload.availableQuantity === undefined) payload.availableQuantity = payload.quantity || 1;
    else payload.availableQuantity = Number(payload.availableQuantity);
    return await SportsEquipment.create(payload);
  }

  async updateEquipment(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    delete payload._id;
    if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity);
    if (payload.availableQuantity !== undefined) payload.availableQuantity = Number(payload.availableQuantity);
    const item = await SportsEquipment.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    );
    if (!item) throw new NotFoundError('Sports equipment not found');
    return item;
  }

  async deleteEquipment(id: string) {
    const item = await SportsEquipment.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!item) throw new NotFoundError('Sports equipment not found');
    return item;
  }

  // --- Practice Session CRUD ---
  async getSessions(sportType?: string) {
    await this.ensureSeedData();
    const query: any = { tenantId: this.tidFilter, isDeleted: { $ne: true } };
    if (sportType && sportType !== 'ALL') query.sportType = sportType;
    return await PracticeSession.find(query).sort({ sessionDate: 1 }).lean();
  }

  async createSession(data: any) {
    const payload = { ...data, tenantId: this.tid };
    delete payload.id;
    delete payload._id;
    if (payload.attendanceCount !== undefined) payload.attendanceCount = Number(payload.attendanceCount);
    return await PracticeSession.create(payload);
  }

  async updateSession(id: string, data: any) {
    const payload = { ...data };
    delete payload.id;
    delete payload._id;
    if (payload.attendanceCount !== undefined) payload.attendanceCount = Number(payload.attendanceCount);
    const session = await PracticeSession.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter, isDeleted: { $ne: true } },
      { $set: payload },
      { new: true }
    );
    if (!session) throw new NotFoundError('Practice session not found');
    return session;
  }

  async deleteSession(id: string) {
    const session = await PracticeSession.findOneAndUpdate(
      { _id: this.toIdOrVal(id), tenantId: this.tidFilter },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!session) throw new NotFoundError('Practice session not found');
    return session;
  }
}
