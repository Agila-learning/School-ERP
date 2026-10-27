/**
 * Phase 112 Demo Seed Script
 * ---------------------------
 * Creates a complete school environment with 18 role-specific demo accounts.
 * Each role has granular permissions (NOT wildcard '*').
 *
 * Run: npx ts-node src/scripts/seed.ts
 *
 * SECURITY: These credentials are for DEVELOPMENT / DEMO only.
 * Never expose in frontend source code.
 * Never run in production with default passwords.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';

// =============================================================
// GRANULAR PERMISSION SETS PER ROLE
// =============================================================
const PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  SCHOOL_ADMIN: [
    'students.view', 'students.manage', 'students.medical.view', 'students.medical.manage', 'students.transfer',
    'hr.employee.view', 'hr.employee.create', 'hr.employee.edit', 'hr.employee.delete', 'hr.employee.manage',
    'hr.department.manage', 'hr.designation.manage',
    'parents.view', 'parents.create', 'parents.update', 'parents.delete',
    'academic.view', 'academic.manage',
    'academic.class.view', 'academic.class.manage',
    'academic.section.view', 'academic.section.manage',
    'academic.subject.view', 'academic.subject.manage',
    'academic.teacher.view', 'academic.teacher.manage',
    'attendance.view', 'attendance.manage',
    'examination.view', 'examination.manage',
    'exam.marks.enter', 'exam.marks.verify', 'exam.marks.moderate',
    'exam.result.calculate', 'exam.result.approve', 'exam.result.publish',
    'exam.report.generate', 'exam.report.view', 'exam.ranking.view',
    'exam.analytics.view', 'exam.paper.create', 'exam.paper.approve',
    'exam.settings.manage', 'exam.calendar.view', 'exam.logistics.manage',
    'finance.view', 'finance.manage',
    'library.view', 'library.manage',
    'transport.view', 'transport.manage',
    'hostel.view', 'hostel.manage',
    'hr.view', 'hr.manage',
    'timetable.view', 'timetable.create', 'timetable.update', 'timetable.delete', 'timetable.publish', 'timetable.generate', 'timetable.manage', 'timetable.substitution.create', 'timetable.substitution.approve', 'timetable.substitution.view', 'timetable.teacher.view', 'timetable.room.view',
    'admission.view', 'admission.manage',
    'leave.view', 'leave.approve',
    'roles.manage', 'settings.manage',
    'reports.view', 'audit.view',
    'health.view', 'health.manage',
    'security.view', 'security.manage',
    'communication.view', 'communication.manage',
    'users.view', 'users.create', 'users.update',
    'tenant.view', 'tenant.manage',
    'system.audit',
    'promotion.view', 'promotion.config', 'promotion.evaluate',
    'promotion.approve', 'promotion.rollover', 'promotion.allocate',
  ],
  ADMIN: [
    'students.view', 'students.manage', 'students.medical.view', 'students.medical.manage', 'students.transfer',
    'hr.employee.view', 'hr.employee.create', 'hr.employee.edit', 'hr.employee.delete', 'hr.employee.manage',
    'hr.department.manage', 'hr.designation.manage',
    'parents.view', 'parents.create', 'parents.update', 'parents.delete',
    'academic.view', 'academic.manage',
    'academic.class.view', 'academic.class.manage',
    'academic.section.view', 'academic.section.manage',
    'academic.subject.view', 'academic.subject.manage',
    'academic.teacher.view', 'academic.teacher.manage',
    'attendance.view', 'attendance.manage',
    'examination.view', 'examination.manage',
    'exam.marks.enter', 'exam.marks.verify', 'exam.marks.moderate',
    'exam.result.calculate', 'exam.result.approve', 'exam.result.publish',
    'exam.report.generate', 'exam.report.view', 'exam.ranking.view',
    'exam.analytics.view', 'exam.paper.create', 'exam.paper.approve',
    'exam.settings.manage', 'exam.calendar.view', 'exam.logistics.manage',
    'finance.view', 'finance.manage',
    'library.view', 'library.manage',
    'transport.view', 'transport.manage',
    'hostel.view', 'hostel.manage',
    'hr.view', 'hr.manage',
    'timetable.view', 'timetable.create', 'timetable.update', 'timetable.delete', 'timetable.publish', 'timetable.generate', 'timetable.manage', 'timetable.substitution.create', 'timetable.substitution.approve', 'timetable.substitution.view', 'timetable.teacher.view', 'timetable.room.view',
    'admission.view', 'admission.manage',
    'leave.view', 'leave.approve',
    'roles.manage', 'settings.manage',
    'reports.view', 'audit.view',
    'health.view', 'health.manage',
    'security.view', 'security.manage',
    'communication.view', 'communication.manage',
    'users.view', 'users.create', 'users.update',
    'tenant.view', 'tenant.manage',
    'system.audit',
    'promotion.view', 'promotion.config', 'promotion.evaluate',
    'promotion.approve', 'promotion.rollover', 'promotion.allocate',
  ],

  PRINCIPAL: [
    'students.view', 'hr.employee.view', 'parents.view',
    'academic.view', 'academic.class.view', 'academic.section.view', 'academic.subject.view', 'academic.teacher.view',
    'attendance.view',
    'examination.view',
    'finance.view',
    'leave.view', 'leave.approve',
    'reports.view',
    'timetable.view', 'timetable.create', 'timetable.update', 'timetable.delete', 'timetable.publish', 'timetable.generate', 'timetable.manage', 'timetable.substitution.create', 'timetable.substitution.approve', 'timetable.substitution.view', 'timetable.teacher.view', 'timetable.room.view',
    'communication.view', 'communication.manage',
    'hr.view',
  ],

  TEACHER: [
    'students.view.assigned',
    'attendance.mark', 'attendance.view.assigned',
    'marks.create', 'marks.update', 'marks.view.assigned',
    'exam.marks.enter',
    'examination.view',
    'assignment.create', 'assignment.update', 'assignment.view',
    'timetable.view',
    'leave.apply',
    'communication.view',
    'profile.view', 'profile.update',
  ],

  CLASS_COORDINATOR: [
    'students.view.assigned',
    'students.view.class',
    'attendance.mark', 'attendance.view.assigned', 'attendance.view.class',
    'marks.create', 'marks.update', 'marks.view.assigned',
    'exam.marks.enter',
    'examination.view',
    'assignment.create', 'assignment.update', 'assignment.view',
    'timetable.view', 'timetable.create', 'timetable.update', 'timetable.manage', 'timetable.publish', 'timetable.substitution.create', 'timetable.teacher.view', 'timetable.room.view',
    'leave.apply',
    'class.coordinator.view', 'class.coordinator.manage',
    'communication.view', 'communication.create',
    'profile.view', 'profile.update'
  ],

  STUDENT: [
    'profile.view',
    'attendance.view.own',
    'marks.view.own',
    'assignment.view', 'assignment.submit',
    'timetable.view',
    'leave.apply',
    'library.view',
    'transport.view.own',
    'hostel.view.own',
    'communication.view',
  ],

  PARENT: [
    'child.profile.view',
    'child.attendance.view',
    'child.marks.view',
    'child.assignments.view',
    'child.timetable.view',
    'child.fees.view',
    'child.library.view',
    'child.transport.view',
    'leave.apply.child',
    'communication.view',
    'meetings.view', 'meetings.book',
  ],

  DRIVER: [
    'transport.vehicle.view.own',
    'transport.route.view.own',
    'transport.trip.view.own',
    'transport.trip.update',
    'transport.trip.start',
    'transport.trip.complete',
    'transport.issue.report',
    'communication.view',
  ],

  TRANSPORT_MANAGER: [
    'transport.view', 'transport.manage',
    'transport.vehicle.view', 'transport.vehicle.manage',
    'transport.route.view', 'transport.route.manage',
    'transport.trip.view', 'transport.trip.manage',
    'transport.staff.view', 'transport.staff.manage',
    'transport.reports.view',
    'students.view',
  ],

  LIBRARIAN: [
    'library.view', 'library.manage',
    'library.book.issue', 'library.book.return',
    'library.fine.manage',
    'students.view',
    'staff.view',
    'communication.view',
  ],

  LAB_TECHNICIAN: [
    'lab.view', 'lab.manage',
    'lab.equipment.view', 'lab.equipment.manage',
    'lab.inventory.view', 'lab.inventory.manage',
    'lab.booking.view', 'lab.booking.manage',
    'communication.view',
  ],

  SPORTS_COACH: [
    'sports.view', 'sports.manage',
    'sports.team.view', 'sports.team.manage',
    'students.view.assigned',
    'attendance.mark.sports',
    'communication.view',
  ],

  FINANCE_ADMIN: [
    'finance.view', 'finance.manage',
    'fees.view', 'fees.manage', 'fees.collect',
    'invoices.view', 'invoices.manage',
    'payments.view', 'payments.manage',
    'reports.view',
    'students.view',
  ],

  HR_ADMIN: [
    'hr.view', 'hr.manage',
    'staff.view', 'staff.create', 'staff.update',
    'leave.view', 'leave.approve',
    'attendance.view',
    'payroll.view', 'payroll.manage',
    'departments.view', 'departments.manage',
    'reports.view',
  ],

  HOSTEL_WARDEN: [
    'hostel.view', 'hostel.manage',
    'students.view.hostel',
    'leave.view', 'leave.approve.hostel',
    'communication.view',
    'security.view',
  ],

  OFFICE_ADMIN: [
    'students.view',
    'admission.view', 'admission.manage',
    'visitors.view', 'visitors.manage',
    'appointments.view', 'appointments.manage',
    'communication.view',
    'leave.view',
    'fees.collect',
  ],

  ADMISSION_STAFF: [
    'admission.view', 'admission.manage',
    'students.view',
    'communication.view',
  ],

  RECEPTIONIST: [
    'visitors.view', 'visitors.manage',
    'appointments.view', 'appointments.manage',
    'students.view',
    'communication.view',
  ],

  NURSE: [
    'health.view', 'health.manage',
    'students.view',
    'communication.view',
  ],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('\n✅ Connected to MongoDB:', MONGO_URI);

  const db = mongoose.connection.db!;

  // ──────────────────────────────────────────────────
  // 1. Upsert Tenant (School Organisation)
  // ──────────────────────────────────────────────────
  let tenant = await db.collection('tenants').findOne({ code: 'FIC001' });
  if (!tenant) {
    const result = await db.collection('tenants').insertOne({
      name: 'FIC International School',
      code: 'FIC001',
      status: 'active',
      address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      contactEmail: 'admin@ficschool.edu',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    tenant = { _id: result.insertedId, code: 'FIC001' };
    console.log('✅ Tenant created');
  } else {
    console.log('ℹ️  Tenant already exists');
  }
  const tenantId = tenant._id;

  // ──────────────────────────────────────────────────
  // 2. Define All Demo Roles with Granular Permissions
  // ──────────────────────────────────────────────────
  const DEMO_ROLES = [
    { name: 'Super Admin',        code: 'SUPER_ADMIN',        permissions: PERMISSIONS.SUPER_ADMIN },
    { name: 'School Admin',       code: 'SCHOOL_ADMIN',       permissions: PERMISSIONS.SCHOOL_ADMIN },
    { name: 'Principal',          code: 'PRINCIPAL',          permissions: PERMISSIONS.PRINCIPAL },
    { name: 'Teacher',            code: 'TEACHER',            permissions: PERMISSIONS.TEACHER },
    { name: 'Class Coordinator',  code: 'CLASS_COORDINATOR',  permissions: PERMISSIONS.CLASS_COORDINATOR },
    { name: 'Student',            code: 'STUDENT',            permissions: PERMISSIONS.STUDENT },
    { name: 'Parent',             code: 'PARENT',             permissions: PERMISSIONS.PARENT },
    { name: 'Driver',             code: 'DRIVER',             permissions: PERMISSIONS.DRIVER },
    { name: 'Transport Manager',  code: 'TRANSPORT_MANAGER',  permissions: PERMISSIONS.TRANSPORT_MANAGER },
    { name: 'Librarian',          code: 'LIBRARIAN',          permissions: PERMISSIONS.LIBRARIAN },
    { name: 'Lab Technician',     code: 'LAB_TECHNICIAN',     permissions: PERMISSIONS.LAB_TECHNICIAN },
    { name: 'Sports Coach',       code: 'SPORTS_COACH',       permissions: PERMISSIONS.SPORTS_COACH },
    { name: 'Finance Admin',      code: 'FINANCE_ADMIN',      permissions: PERMISSIONS.FINANCE_ADMIN },
    { name: 'HR Admin',           code: 'HR_ADMIN',           permissions: PERMISSIONS.HR_ADMIN },
    { name: 'Hostel Warden',      code: 'HOSTEL_WARDEN',      permissions: PERMISSIONS.HOSTEL_WARDEN },
    { name: 'Office Admin',       code: 'OFFICE_ADMIN',       permissions: PERMISSIONS.OFFICE_ADMIN },
    { name: 'Admission Staff',    code: 'ADMISSION_STAFF',    permissions: PERMISSIONS.ADMISSION_STAFF },
    { name: 'Receptionist',       code: 'RECEPTIONIST',       permissions: PERMISSIONS.RECEPTIONIST },
    { name: 'Nurse',              code: 'NURSE',              permissions: PERMISSIONS.NURSE },
  ];

  const roleMap: Record<string, any> = {};
  for (const r of DEMO_ROLES) {
    const existing = await db.collection('roles').findOne({ tenantId, name: r.name });
    if (!existing) {
      const res = await db.collection('roles').insertOne({
        tenantId, name: r.name, code: r.code, permissions: r.permissions,
        isSystem: true, createdAt: new Date(), updatedAt: new Date(),
      });
      roleMap[r.code] = res.insertedId;
    } else {
      // Update permissions to latest
      await db.collection('roles').updateOne({ _id: existing._id }, { $set: { permissions: r.permissions, code: r.code } });
      roleMap[r.code] = existing._id;
    }
  }
  console.log(`✅ ${Object.keys(roleMap).length} roles upserted`);

  // ──────────────────────────────────────────────────
  // 3. Create All Demo Users
  // ──────────────────────────────────────────────────
  const DEMO_USERS = [
    { email: 'superadmin@ficschool.edu', password: 'SuperAdmin@1234', first: 'Platform', last: 'Admin',     roles: ['SUPER_ADMIN'],       dashboardRoute: '/super-admin/dashboard' },
    { email: 'admin@ficschool.edu',      password: 'Admin@1234',      first: 'School',   last: 'Admin',     roles: ['SCHOOL_ADMIN'],      dashboardRoute: '/admin/dashboard' },
    { email: 'principal@ficschool.edu',  password: 'Principal@1234',  first: 'Dr. Ravi', last: 'Sharma',    roles: ['PRINCIPAL'],         dashboardRoute: '/principal/dashboard' },
    { email: 'teacher@ficschool.edu',    password: 'Teacher@1234',    first: 'Priya',    last: 'Mehta',     roles: ['TEACHER', 'CLASS_COORDINATOR'], dashboardRoute: '/teacher/dashboard' },
    { email: 'teacher2@ficschool.edu',   password: 'Teacher@1234',    first: 'Rajan',    last: 'Kumar',     roles: ['TEACHER'],           dashboardRoute: '/teacher/dashboard' },
    { email: 'student@ficschool.edu',    password: 'Student@1234',    first: 'Arjun',    last: 'Patel',     roles: ['STUDENT'],           dashboardRoute: '/student-portal/dashboard' },
    { email: 'parent@ficschool.edu',     password: 'Parent@1234',     first: 'Suresh',   last: 'Patel',     roles: ['PARENT'],            dashboardRoute: '/parent-portal' },
    { email: 'driver@ficschool.edu',     password: 'Driver@1234',     first: 'Ramesh',   last: 'Singh',     roles: ['DRIVER'],            dashboardRoute: '/driver/dashboard' },
    { email: 'transport@ficschool.edu',  password: 'Transport@1234',  first: 'Mohan',    last: 'Das',       roles: ['TRANSPORT_MANAGER'], dashboardRoute: '/transport/dashboard' },
    { email: 'librarian@ficschool.edu',  password: 'Librarian@1234',  first: 'Kavita',   last: 'Nair',      roles: ['LIBRARIAN'],         dashboardRoute: '/library/dashboard' },
    { email: 'labtech@ficschool.edu',    password: 'LabTech@1234',    first: 'Sunil',    last: 'Verma',     roles: ['LAB_TECHNICIAN'],    dashboardRoute: '/lab/dashboard' },
    { email: 'sports@ficschool.edu',     password: 'Sports@1234',     first: 'Arun',     last: 'Khanna',    roles: ['SPORTS_COACH'],      dashboardRoute: '/sports/dashboard' },
    { email: 'finance@ficschool.edu',    password: 'Finance@1234',    first: 'Anita',    last: 'Gupta',     roles: ['FINANCE_ADMIN'],     dashboardRoute: '/finance/dashboard' },
    { email: 'hr@ficschool.edu',         password: 'Hr@1234',         first: 'Rekha',    last: 'Joshi',     roles: ['HR_ADMIN'],          dashboardRoute: '/hr/dashboard' },
    { email: 'warden@ficschool.edu',     password: 'Warden@1234',     first: 'Vijay',    last: 'Nambiar',   roles: ['HOSTEL_WARDEN'],     dashboardRoute: '/hostel/dashboard' },
    { email: 'office@ficschool.edu',     password: 'Office@1234',     first: 'Geeta',    last: 'Pillai',    roles: ['OFFICE_ADMIN'],      dashboardRoute: '/office/dashboard' },
    { email: 'admission@ficschool.edu',  password: 'Admission@1234',  first: 'Neha',     last: 'Desai',     roles: ['ADMISSION_STAFF'],   dashboardRoute: '/office/dashboard' },
    { email: 'reception@ficschool.edu',  password: 'Reception@1234',  first: 'Pooja',    last: 'Shah',      roles: ['RECEPTIONIST'],      dashboardRoute: '/office/dashboard' },
    { email: 'nurse@ficschool.edu',      password: 'Nurse@1234',      first: 'Lakshmi',  last: 'Iyer',      roles: ['NURSE'],             dashboardRoute: '/health/dashboard' },
  ];

  const userMap: Record<string, any> = {};
  for (const du of DEMO_USERS) {
    const hashedPassword = await bcrypt.hash(du.password, 10);
    const userRoleIds = du.roles.map(r => roleMap[r]).filter(Boolean);

    const existing = await db.collection('users').findOne({ tenantId, email: du.email });
    if (!existing) {
      const res = await db.collection('users').insertOne({
        tenantId,
        firstName: du.first, lastName: du.last,
        email: du.email, password: hashedPassword,
        roleIds: userRoleIds,
        accountStatus: 'active',
        forcePasswordReset: false,
        failedLoginAttempts: 0,
        isDeleted: false,
        createdAt: new Date(), updatedAt: new Date(),
      });
      userMap[du.email] = res.insertedId;
      console.log(`  ✅ Created user: ${du.email} [${du.roles.join('+')}]`);
    } else {
      await db.collection('users').updateOne(
        { _id: existing._id },
        { $set: { password: hashedPassword, roleIds: userRoleIds, accountStatus: 'active', failedLoginAttempts: 0 } }
      );
      userMap[du.email] = existing._id;
      console.log(`  ℹ️  Updated user: ${du.email}`);
    }
  }

  // ──────────────────────────────────────────────────
  // Summary Credentials
  // ──────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  PHASE 112 DEMO CREDENTIALS — DEVELOPMENT / TESTING ONLY');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  School Code (for login): FIC001');
  console.log('  App URL: http://localhost:5173\n');
  const rows = [
    ['SUPER_ADMIN',      'superadmin@ficschool.edu',  'SuperAdmin@1234',  '/super-admin/dashboard'],
    ['SCHOOL_ADMIN',     'admin@ficschool.edu',        'Admin@1234',       '/admin/dashboard'],
    ['PRINCIPAL',        'principal@ficschool.edu',    'Principal@1234',   '/principal/dashboard'],
    ['TEACHER+COORD',    'teacher@ficschool.edu',      'Teacher@1234',     '/teacher/dashboard'],
    ['TEACHER',          'teacher2@ficschool.edu',     'Teacher@1234',     '/teacher/dashboard'],
    ['STUDENT',          'student@ficschool.edu',      'Student@1234',     '/student-portal/dashboard'],
    ['PARENT',           'parent@ficschool.edu',       'Parent@1234',      '/parent-portal'],
    ['DRIVER',           'driver@ficschool.edu',       'Driver@1234',      '/driver/dashboard'],
    ['TRANSPORT_MGR',    'transport@ficschool.edu',    'Transport@1234',   '/transport/dashboard'],
    ['LIBRARIAN',        'librarian@ficschool.edu',    'Librarian@1234',   '/library/dashboard'],
    ['LAB_TECH',         'labtech@ficschool.edu',      'LabTech@1234',     '/lab/dashboard'],
    ['SPORTS_COACH',     'sports@ficschool.edu',       'Sports@1234',      '/sports/dashboard'],
    ['FINANCE_ADMIN',    'finance@ficschool.edu',      'Finance@1234',     '/finance/dashboard'],
    ['HR_ADMIN',         'hr@ficschool.edu',            'Hr@1234',          '/hr/dashboard'],
    ['HOSTEL_WARDEN',    'warden@ficschool.edu',       'Warden@1234',      '/hostel/dashboard'],
    ['OFFICE_ADMIN',     'office@ficschool.edu',       'Office@1234',      '/office/dashboard'],
    ['ADMISSION',        'admission@ficschool.edu',    'Admission@1234',   '/office/dashboard'],
    ['RECEPTIONIST',     'reception@ficschool.edu',    'Reception@1234',   '/office/dashboard'],
    ['NURSE',            'nurse@ficschool.edu',        'Nurse@1234',       '/health/dashboard'],
  ];
  console.log(`  ${'ROLE'.padEnd(15)} | ${'EMAIL'.padEnd(35)} | ${'PASSWORD'.padEnd(18)} | DASHBOARD`);
  console.log(`  ${'-'.repeat(90)}`);
  for (const [role, email, pass, route] of rows) {
    console.log(`  ${role.padEnd(15)} | ${email.padEnd(35)} | ${pass.padEnd(18)} | ${route}`);
  }
  console.log('═══════════════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('✅ Seed complete. Disconnected.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
