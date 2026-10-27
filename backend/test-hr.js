require('dotenv').config();
const mongoose = require('mongoose');
const { env } = require('./src/config/env');
const { EmployeeService } = require('./src/modules/hr/services/employee.service');

async function run() {
  await mongoose.connect(env.mongoUri);
  const tenantId = '66d0c2e36bf2c450a80e0c15'; // from typical seeding
  const userId = new mongoose.Types.ObjectId().toString();

  const service = new EmployeeService(tenantId);
  try {
    const data = {
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date().toISOString(),
      gender: 'Male',
      nationality: 'Indian',
      mobile: '1234567890',
      email: 'test' + Date.now() + '@example.com',
      address: { current: 'Test Addr' },
      emergencyContact: {
        name: 'John',
        relationship: 'Brother',
        phone: '0987654321'
      },
      departmentId: new mongoose.Types.ObjectId().toString(),
      designationId: new mongoose.Types.ObjectId().toString(),
      employmentType: 'Permanent',
      joiningDate: new Date().toISOString(),
      branchId: new mongoose.Types.ObjectId().toString(),
      createUserAccount: true,
      isTeacher: false
    };

    const res = await service.onboardEmployee(data, userId);
    console.log('SUCCESS:', res);
  } catch (err) {
    console.error('ERROR:', err);
  }
  process.exit();
}
run();
