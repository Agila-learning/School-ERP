import mongoose from 'mongoose';
import StudentProfile from '../../students/models/StudentProfile.model';
import Employee from '../../hr/models/Employee.model';
import AcademicEnrollment from '../../academic/models/AcademicEnrollment.model';
import StudentDailyAttendance from '../../attendance/models/StudentDailyAttendance.model';
import Invoice from '../../finance/models/Invoice.model';
import AuditLog from '../../audit/models/AuditLog.model';

// Use any to prevent typescript error if vehicle/event doesn't exist
const Vehicle = mongoose.models.Vehicle;
const EventModel = mongoose.models.Event;

export class AdminAnalyticsService {
  /**
   * Get basic dashboard counts (Students, Staff, Teachers, Vehicles)
   */
  static async getDashboardSummary(tenantId: string, academicYearId?: string) {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    
    // Some models don't have academicYearId (e.g. Employee)
    // For students and vehicles we might filter if necessary, but StudentProfile is global
    // AcademicEnrollment is per year, so we can use that for student count if year is given
    let studentCountPromise;
    if (academicYearId && mongoose.isValidObjectId(academicYearId)) {
      studentCountPromise = AcademicEnrollment.countDocuments({ tenantId: tenantObjectId, academicYearId: new mongoose.Types.ObjectId(academicYearId), status: 'ACTIVE' });
    } else {
      studentCountPromise = StudentProfile.countDocuments({ tenantId: tenantObjectId });
    }

    const [totalStudents, totalStaff, totalTeachers, activeVehicles] = await Promise.all([
      studentCountPromise,
      Employee.countDocuments({ tenantId: tenantObjectId, employmentStatus: 'ACTIVE' }),
      Employee.countDocuments({ tenantId: tenantObjectId, employmentStatus: 'ACTIVE', designationId: { $exists: true } }),
      Vehicle ? Vehicle.countDocuments({ tenantId: tenantObjectId, status: 'ACTIVE' }) : Promise.resolve(0),
    ]);

    return {
      totalStudents,
      totalStaff,
      totalTeachers,
      activeVehicles,
    };
  }

  /**
   * Get attendance summary and 7-day trend
   */
  static async getAttendanceSummary(tenantId: string, academicYearId?: string) {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    
    const filter: any = { tenantId: tenantObjectId };
    if (academicYearId && mongoose.isValidObjectId(academicYearId)) {
      filter.academicYearId = new mongoose.Types.ObjectId(academicYearId);
    }

    // Get today's attendance snapshot
    const todayDocs = await StudentDailyAttendance.find({
      ...filter,
      date: { $gte: today },
    });

    let present = 0;
    let absent = 0;
    let late = 0;

    todayDocs.forEach((doc: any) => {
      doc.entries.forEach((entry: any) => {
        if (entry.status === 'PRESENT') present++;
        else if (entry.status === 'ABSENT') absent++;
        else if (entry.status === 'LATE') late++;
      });
    });

    const activeEnrollments = await AcademicEnrollment.countDocuments({ ...filter, status: 'ACTIVE' });
    const notMarked = Math.max(0, activeEnrollments - (present + absent + late));

    // Get 7-day trend using Aggregation Pipeline
    const trendData = await StudentDailyAttendance.aggregate([
      {
        $match: {
          ...filter,
          date: { $gte: sevenDaysAgo },
        },
      },
      { $unwind: '$entries' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          present: {
            $sum: { $cond: [{ $eq: ['$entries.status', 'PRESENT'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$entries.status', 'ABSENT'] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ['$entries.status', 'LATE'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days
    const trend = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const found = trendData.find((t: any) => t._id === dateStr);
      return {
        date: dateStr,
        present: found ? found.present : 0,
        absent: found ? found.absent : 0,
        late: found ? found.late : 0,
      };
    });

    return {
      present,
      absent,
      late,
      notMarked,
      trend,
    };
  }

  /**
   * Get fee collection summary and monthly trend
   */
  static async getFeeSummary(tenantId: string, academicYearId?: string) {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    
    const filter: any = { tenantId: tenantObjectId };
    if (academicYearId && mongoose.isValidObjectId(academicYearId)) {
      filter.academicYearId = new mongoose.Types.ObjectId(academicYearId);
    }

    // Total collected, pending, overdue
    const invoices = await Invoice.find(filter);
    
    let collected = 0;
    let pending = 0;
    let overdue = 0;

    const now = new Date();

    invoices.forEach((inv: any) => {
      collected += (inv.amountPaid || 0);
      pending += (inv.balanceDue || 0);
      
      if (inv.dueDate && inv.dueDate < now && inv.balanceDue > 0) {
        overdue += inv.balanceDue;
      }
    });

    // Monthly trend for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trendData = await Invoice.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          amount: { $sum: '$amountPaid' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const trend = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      
      const found = trendData.find((t: any) => t._id.year === y && t._id.month === m);
      return {
        month: `${monthNames[m - 1]} ${y}`,
        amount: found ? found.amount : 0,
      };
    });

    return {
      collected,
      pending,
      overdue,
      trend,
    };
  }

  /**
   * Get Upcoming Events
   */
  static async getUpcomingEvents(tenantId: string) {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    
    if (!EventModel) return [];

    const events = await EventModel.find({
      tenantId: tenantObjectId,
      startDate: { $gte: new Date() }
    }).sort({ startDate: 1 }).limit(5);

    return events.map((e: any) => ({
      id: e._id.toString(),
      title: e.title,
      date: e.startDate.toISOString(),
      type: e.eventType?.toLowerCase() || 'event'
    }));
  }

  /**
   * Get Recent Activities from Audit Log
   */
  static async getRecentActivities(tenantId: string) {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    
    const logs = await AuditLog.find({ tenantId: tenantObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('performedBy', 'firstName lastName');

    return logs.map((log: any) => {
      let status = 'info';
      if (log.action === 'CREATE') status = 'success';
      if (log.action === 'UPDATE') status = 'warning';
      if (log.action === 'DELETE') status = 'error';

      const user = log.performedBy ? `${(log.performedBy as any).firstName} ${(log.performedBy as any).lastName}` : 'System';

      return {
        id: log._id.toString(),
        action: `${log.action} ${log.entityType}`,
        user,
        time: log.createdAt.toISOString(),
        status,
      };
    });
  }

  /**
   * Get Action Items (Tasks pending)
   */
  static async getActionItems(tenantId: string) {
    // Placeholder for real action items engine
    return [];
  }
}
