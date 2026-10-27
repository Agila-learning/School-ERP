/**
 * Seed Kindergarten Specific Staff, Student, and Parent Accounts for FIC001
 * Run with: node seed-kg-users.cjs
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';

async function seedKg() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI);

  const db = mongoose.connection.db;

  // 1. Find tenant FIC001
  let tenant = await db.collection('tenants').findOne({ code: 'FIC001' });
  if (!tenant) {
    tenant = await db.collection('tenants').findOne({});
  }
  if (!tenant) {
    console.error('❌ No tenant found in database.');
    process.exit(1);
  }
  const tenantId = tenant._id;
  console.log(`✅ Using Tenant: ${tenant.name || tenant.code} (${tenantId})`);

  // 2. Ensure Roles: KINDERGARTEN_TEACHER, STUDENT, PARENT
  const KG_PERMISSIONS = [
    'academic.view', 'academic.manage',
    'attendance.view', 'attendance.manage',
    'students.view', 'students.manage',
    'communication.view', 'communication.manage',
    'health.view', 'health.manage',
    'leave.view', 'timetable.view'
  ];

  let kgTeacherRole = await db.collection('roles').findOne({ 
    tenantId, 
    $or: [{ name: 'Kindergarten Teacher' }, { code: 'KINDERGARTEN_TEACHER' }] 
  });
  if (!kgTeacherRole) {
    const res = await db.collection('roles').insertOne({
      tenantId,
      name: 'Kindergarten Teacher',
      code: 'KINDERGARTEN_TEACHER',
      permissions: KG_PERMISSIONS,
      dashboardRoute: '/kindergarten/dashboard',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    kgTeacherRole = { _id: res.insertedId };
    console.log('  ✅ Created role: Kindergarten Teacher (KINDERGARTEN_TEACHER)');
  } else {
    await db.collection('roles').updateOne(
      { _id: kgTeacherRole._id },
      { 
        $set: { 
          permissions: KG_PERMISSIONS, 
          code: 'KINDERGARTEN_TEACHER', 
          dashboardRoute: '/kindergarten/dashboard',
          updatedAt: new Date()
        } 
      }
    );
    console.log('  ⚡ Updated role: Kindergarten Teacher');
  }

  let studentRole = await db.collection('roles').findOne({ 
    tenantId, 
    $or: [{ name: 'Student' }, { code: 'STUDENT' }] 
  });
  if (!studentRole) {
    const res = await db.collection('roles').insertOne({
      tenantId,
      name: 'Student',
      code: 'STUDENT',
      permissions: ['students.view', 'attendance.view', 'examination.view', 'communication.view', 'library.view'],
      dashboardRoute: '/student-portal/dashboard',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    studentRole = { _id: res.insertedId };
  }

  let parentRole = await db.collection('roles').findOne({ 
    tenantId, 
    $or: [{ name: 'Parent' }, { code: 'PARENT' }] 
  });
  if (!parentRole) {
    const res = await db.collection('roles').insertOne({
      tenantId,
      name: 'Parent',
      code: 'PARENT',
      permissions: ['students.view', 'attendance.view', 'examination.view', 'communication.view', 'finance.view'],
      dashboardRoute: '/parent-portal',
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    parentRole = { _id: res.insertedId };
  }

  // 3. Demo KG Users
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password@123', salt);

  const DEMO_KG_ACCOUNTS = [
    {
      email: 'kg.staff@ficschool.edu',
      firstName: 'Devaki',
      lastName: 'Raman',
      roleId: kgTeacherRole._id,
      roleName: 'Kindergarten Teacher',
      category: 'STAFF'
    },
    {
      email: 'kg.teacher@ficschool.edu',
      firstName: 'Keerthana',
      lastName: 'R',
      roleId: kgTeacherRole._id,
      roleName: 'Kindergarten Teacher',
      category: 'STAFF'
    },
    {
      email: 'kg.student@ficschool.edu',
      firstName: 'Aarav',
      lastName: 'Sharma',
      roleId: studentRole._id,
      roleName: 'Student',
      category: 'STUDENT'
    },
    {
      email: 'kg.parent@ficschool.edu',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      roleId: parentRole._id,
      roleName: 'Parent',
      category: 'PARENT'
    }
  ];

  const createdUserMap = {};

  for (const acc of DEMO_KG_ACCOUNTS) {
    const existing = await db.collection('users').findOne({ tenantId, email: acc.email });
    if (!existing) {
      const res = await db.collection('users').insertOne({
        tenantId,
        firstName: acc.firstName,
        lastName: acc.lastName,
        email: acc.email,
        password: defaultPasswordHash,
        roleIds: [acc.roleId],
        accountStatus: 'active',
        forcePasswordReset: false,
        failedLoginAttempts: 0,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      createdUserMap[acc.email] = res.insertedId;
      console.log(`  ✅ User created: ${acc.email} (${acc.roleName})`);
    } else {
      await db.collection('users').updateOne(
        { _id: existing._id },
        { 
          $set: { 
            password: defaultPasswordHash, 
            roleIds: [acc.roleId], 
            accountStatus: 'active', 
            failedLoginAttempts: 0,
            updatedAt: new Date()
          } 
        }
      );
      createdUserMap[acc.email] = existing._id;
      console.log(`  ⚡ User updated: ${acc.email} (${acc.roleName})`);
    }
  }

  // 4. Link / Upsert Kindergarten Student Profile
  const studentUserId = createdUserMap['kg.student@ficschool.edu'];
  const kgProfileData = {
    tenantId,
    userId: studentUserId,
    studentIdNumber: 'KG-2026-001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    dateOfBirth: new Date('2021-08-14'),
    gender: 'Male',
    bloodGroup: 'B+ Positive',
    nationality: 'Indian',
    category: 'KINDERGARTEN',
    class: 'UKG',
    section: 'Butterflies (Section A)',
    emergencyContacts: [
      {
        name: 'Rajesh Sharma',
        relationship: 'Father',
        mobile: '9876543210',
        priority: 1
      },
      {
        name: 'Pooja Sharma',
        relationship: 'Mother',
        mobile: '9876543211',
        priority: 2
      }
    ],
    sportsParticipation: ['Mini Athletics', 'Sensory Play'],
    isDeleted: false,
    updatedAt: new Date()
  };

  const existingProfile = await db.collection('studentprofiles').findOne({ 
    tenantId, 
    $or: [{ userId: studentUserId }, { studentIdNumber: 'KG-2026-001' }]
  });

  if (!existingProfile) {
    await db.collection('studentprofiles').insertOne({
      ...kgProfileData,
      createdAt: new Date()
    });
    console.log('  ✅ StudentProfile created for Aarav Sharma (KG-2026-001, Category: KINDERGARTEN)');
  } else {
    await db.collection('studentprofiles').updateOne(
      { _id: existingProfile._id },
      { $set: kgProfileData }
    );
    console.log('  ⚡ StudentProfile updated for Aarav Sharma (KG-2026-001, Category: KINDERGARTEN)');
  }

  console.log('\n============================================================');
  console.log('       KINDERGARTEN CREDENTIALS SEEDED SUCCESSFULLY         ');
  console.log('============================================================');
  console.log('Tenant Code:      FIC001');
  console.log('Web URL:          http://localhost:5173\n');
  console.log('1. STAFF / LEAD EDUCATOR DASHBOARD:');
  console.log('   Email:         kg.staff@ficschool.edu (or kg.teacher@ficschool.edu)');
  console.log('   Password:      Password@123');
  console.log('   Role:          Kindergarten Teacher (KINDERGARTEN_TEACHER)');
  console.log('   Dashboard URL: http://localhost:5173/kindergarten/dashboard\n');
  console.log('2. STUDENT DASHBOARD (KINDERGARTEN SCHOLAR):');
  console.log('   Email:         kg.student@ficschool.edu');
  console.log('   Password:      Password@123');
  console.log('   Role:          Student (Category: KINDERGARTEN, Class: UKG)');
  console.log('   Dashboard URL: http://localhost:5173/student-portal/dashboard\n');
  console.log('3. PARENT DASHBOARD:');
  console.log('   Email:         kg.parent@ficschool.edu');
  console.log('   Password:      Password@123');
  console.log('   Role:          Parent');
  console.log('   Portal URL:    http://localhost:5173/parent-portal\n');
  console.log('4. ALL-WING SCHOOL ADMIN:');
  console.log('   Email:         admin@ficschool.edu');
  console.log('   Password:      Admin@1234');
  console.log('   Dashboard URL: http://localhost:5173/admin/dashboard');
  console.log('============================================================\n');

  await mongoose.disconnect();
}

seedKg().catch(err => {
  console.error('❌ Failed seeding KG accounts:', err);
  process.exit(1);
});
