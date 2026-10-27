const axios = require('axios');

async function run() {
  try {
    console.log('1. Logging in...');
    const loginRes = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'admin@ficschool.edu',
      password: 'Admin@1234'
    }, {
      headers: { 'x-tenant-id': 'FIC001' }
    });
    
    const token = loginRes.data.data.token;
    console.log('Login successful.');

    console.log('2. Creating Staff Member...');
    const submitRes = await axios.post('http://localhost:5001/api/v1/hr/employees', {
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('1990-01-01').toISOString(),
      gender: 'Female',
      nationality: 'Indian',
      mobile: '9876543211',
      email: 'jane.smith2@ficschool.edu',
      address: {
        current: '456 Side St'
      },
      emergencyContact: {
        name: 'John Smith',
        relationship: 'Spouse',
        phone: '9876543212'
      },
      departmentId: '66b5bd9e1a2b3c4d5e6f7a8b',
      designationId: '66b5bd9e1a2b3c4d5e6f7a8b',
      employmentType: 'Permanent',
      joiningDate: new Date().toISOString(),
      branchId: '66b5bd9e1a2b3c4d5e6f7a8b',
      createUserAccount: true,
      isTeacher: true
    }, {
      headers: { 
        'x-tenant-id': 'FIC001',
        'Authorization': `Bearer ${token}` 
      }
    });

    console.log(`Staff created. ID: ${submitRes.data.data._id}`);

  } catch (err) {
    console.error('Test failed:', err.response ? err.response.data : err.message);
  }
}

run();
