/**
 * RBAC Multi-Role Seed Script
 * Creates demo users for each role: Teacher, Office Staff, Non-Teaching Staff,
 * Parent, Security Guard, Librarian, Accountant for tenant FIC001
 * 
 * Run with: node seed-rbac-users.cjs
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';

const ROLES_TO_CREATE = [
  {
    name: 'Teacher',
    permissions: [
      'academic.view', 'attendance.view', 'attendance.manage',
      'examination.view', 'examination.manage', 'students.view',
      'communication.view', 'leave.view', 'timetable.view',
      'library.view', 'teacher.view', 'health.view'
    ],
    dashboardRoute: '/teacher/dashboard'
  },
  {
    name: 'Office Staff',
    permissions: [
      'students.view', 'students.create', 'students.manage', 'students.documents.manage',
      'admission.view', 'admission.manage',
      'finance.view', 'finance.manage', 'security.pass.view',
      'communication.view', 'communication.manage', 'hr.view',
      'attendance.view', 'leave.view', 'timetable.view',
      'document.view', 'document.upload'
    ],
    dashboardRoute: '/office/dashboard'
  },
  {
    name: 'Non-Teaching Staff',
    permissions: [
      'leave.view', 'communication.view', 'hr.view'
    ],
    dashboardRoute: '/staff/dashboard'
  },
  {
    name: 'Parent',
    permissions: [
      'students.view', 'attendance.view', 'examination.view',
      'communication.view', 'finance.view', 'library.view'
    ],
    dashboardRoute: '/parent-portal'
  },
  {
    name: 'Security',
    permissions: [
      'security.view', 'security.visitor.view', 'security.visitor.manage',
      'security.pass.view', 'security.pickup.view', 'security.vehicle.view',
      'security.delivery.view', 'security.incident.view', 'security.shift.view'
    ],
    dashboardRoute: '/admin/security/dashboard'
  },
  {
    name: 'Librarian',
    permissions: [
      'library.view', 'library.manage', 'students.view', 'communication.view'
    ],
    dashboardRoute: '/library/dashboard'
  },
  {
    name: 'Accountant',
    permissions: [
      'finance.view', 'finance.manage', 'accounting.view',
      'accounting.accounts.manage', 'accounting.journal.post',
      'accounting.ledger.view', 'accounting.expense.manage',
      'procurement.view', 'payroll.manage'
    ],
    dashboardRoute: '/finance/dashboard'
  },
  {
    name: 'Academic Coordinator',
    permissions: [
      'students.view', 'students.manage',
      'academic.view', 'academic.manage',
      'academic.class.view', 'academic.class.manage',
      'academic.section.view', 'academic.section.manage',
      'academic.subject.view', 'academic.subject.manage',
      'academic.teacher.view', 'academic.teacher.manage',
      'attendance.view', 'attendance.manage',
      'examination.view', 'examination.manage',
      'timetable.view', 'timetable.create', 'timetable.update', 'timetable.delete', 'timetable.publish', 'timetable.generate', 'timetable.manage', 'timetable.substitution.create', 'timetable.substitution.approve', 'timetable.substitution.view', 'timetable.teacher.view', 'timetable.room.view',
      'communication.view', 'leave.view'
    ],
    dashboardRoute: '/timetable/dashboard'
  },
  {
    name: 'Admin',
    permissions: [
      'students.view', 'students.create', 'students.manage', 'students.documents.manage',
      'staff.view', 'staff.create', 'staff.employment.manage',
      'academic.view', 'academic.manage', 'hr.view', 'hr.manage',
      'finance.view', 'finance.manage', 'communication.view',
      'communication.manage', 'attendance.view', 'attendance.manage',
      'tenant.view', 'users.view', 'library.view', 'transport.view',
      'security.view', 'hostel.view', 'events.view', 'health.view',
      'examination.view', 'examination.manage', 'leave.view', 'leave.manage',
      'procurement.view', 'procurement.manage', 'vendor.view', 'inventory.view',
      'assets.view', 'facilities.view', 'alumni.view', 'career.view',
      'timetable.view', 'timetable.create', 'timetable.update', 'timetable.delete', 'timetable.publish', 'timetable.generate', 'timetable.manage', 'timetable.substitution.create', 'timetable.substitution.approve', 'timetable.substitution.view', 'timetable.teacher.view', 'timetable.room.view',
      'document.view', 'document.upload', 'document.approve',
      'payroll.manage', 'promotion.view', 'safety.view'
    ],
    dashboardRoute: '/admin/dashboard'
  }
];

const DEMO_USERS = [
  { firstName: 'Ravi', lastName: 'Kumar', email: 'teacher@ficschool.edu', password: 'Teacher@1234', roleName: 'Teacher' },
  { firstName: 'Priya', lastName: 'Mehta', email: 'office@ficschool.edu', password: 'Office@1234', roleName: 'Office Staff' },
  { firstName: 'Suresh', lastName: 'Nair', email: 'staff@ficschool.edu', password: 'Staff@1234', roleName: 'Non-Teaching Staff' },
  { firstName: 'Anita', lastName: 'Sharma', email: 'parent@ficschool.edu', password: 'Parent@1234', roleName: 'Parent' },
  { firstName: 'Ramesh', lastName: 'Gupta', email: 'security@ficschool.edu', password: 'Security@1234', roleName: 'Security' },
  { firstName: 'Kavita', lastName: 'Rao', email: 'librarian@ficschool.edu', password: 'Library@1234', roleName: 'Librarian' },
  { firstName: 'Deepak', lastName: 'Joshi', email: 'accounts@ficschool.edu', password: 'Accounts@1234', roleName: 'Accountant' },
  { firstName: 'School', lastName: 'Admin', email: 'schooladmin@ficschool.edu', password: 'Admin@1234', roleName: 'Admin' },
];

async function seedRbacUsers() {
  await mongoose.connect(MONGO_URI);
  console.log('\n✅ Connected to MongoDB:', MONGO_URI);

  const db = mongoose.connection.db;

  // Find tenant
  const tenant = await db.collection('tenants').findOne({ code: 'FIC001' });
  if (!tenant) {
    console.error('❌ Tenant FIC001 not found. Run seed.cjs first.');
    process.exit(1);
  }
  console.log('✅ Tenant found:', tenant.name);

  // Create roles
  const roleMap = {};
  for (const roleDef of ROLES_TO_CREATE) {
    let role = await db.collection('roles').findOne({ tenantId: tenant._id, name: roleDef.name });
    if (!role) {
      const result = await db.collection('roles').insertOne({
        tenantId: tenant._id,
        name: roleDef.name,
        permissions: roleDef.permissions,
        dashboardRoute: roleDef.dashboardRoute,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      role = { _id: result.insertedId };
      console.log(`  ✅ Role created: ${roleDef.name}`);
    } else {
      // Update permissions
      await db.collection('roles').updateOne({ _id: role._id }, {
        $set: { permissions: roleDef.permissions, dashboardRoute: roleDef.dashboardRoute, updatedAt: new Date() }
      });
      console.log(`  ⚡ Role updated: ${roleDef.name}`);
    }
    roleMap[roleDef.name] = role._id;
  }

  console.log('\n📝 Creating demo users...\n');
  const salt = await bcrypt.genSalt(10);

  for (const userDef of DEMO_USERS) {
    const hashedPassword = await bcrypt.hash(userDef.password, salt);
    const roleId = roleMap[userDef.roleName];

    const existingUser = await db.collection('users').findOne({ tenantId: tenant._id, email: userDef.email });
    if (!existingUser) {
      await db.collection('users').insertOne({
        tenantId: tenant._id,
        firstName: userDef.firstName,
        lastName: userDef.lastName,
        email: userDef.email,
        password: hashedPassword,
        roleIds: [roleId],
        accountStatus: 'active',
        failedLoginAttempts: 0,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  ✅ User created: ${userDef.email}`);
    } else {
      await db.collection('users').updateOne({ _id: existingUser._id }, {
        $set: { password: hashedPassword, accountStatus: 'active', failedLoginAttempts: 0, roleIds: [roleId] }
      });
      console.log(`  ⚡ User reset:   ${userDef.email}`);
    }
  }

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║              FIC001 SCHOOL ERP — DEMO CREDENTIALS               ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log('║  School Code (Tenant): FIC001                                   ║');
  console.log('║  URL: http://localhost:5173                                      ║');
  console.log('╠══════════════════╦══════════════════════════╦════════════════════╣');
  console.log('║  Role            ║  Email                   ║  Password          ║');
  console.log('╠══════════════════╬══════════════════════════╬════════════════════╣');
  console.log('║  Super Admin     ║  admin@ficschool.edu     ║  Admin@1234        ║');
  console.log('║  Admin           ║  schooladmin@ficschool.edu║ Admin@1234        ║');
  console.log('║  Teacher         ║  teacher@ficschool.edu   ║  Teacher@1234      ║');
  console.log('║  Office Staff    ║  office@ficschool.edu    ║  Office@1234       ║');
  console.log('║  Non-Teaching    ║  staff@ficschool.edu     ║  Staff@1234        ║');
  console.log('║  Parent          ║  parent@ficschool.edu    ║  Parent@1234       ║');
  console.log('║  Security Guard  ║  security@ficschool.edu  ║  Security@1234     ║');
  console.log('║  Librarian       ║  librarian@ficschool.edu ║  Library@1234      ║');
  console.log('║  Accountant      ║  accounts@ficschool.edu  ║  Accounts@1234     ║');
  console.log('╚══════════════════╩══════════════════════════╩════════════════════╝');
  console.log('');

  await mongoose.disconnect();
}

seedRbacUsers().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
