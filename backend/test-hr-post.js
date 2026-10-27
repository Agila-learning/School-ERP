const axios = require('axios');

async function testOnboard() {
  try {
    const loginRes = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'admin@ficschool.edu',
      password: 'Admin@1234'
    }, {
      headers: {
        'x-tenant-id': 'FIC001'
      }
    });

    const token = loginRes.data.data.token;
    console.log('Login successful');

    const res = await axios.post('http://localhost:5001/api/v1/hr/employees', {
      firstName: 'Test',
      lastName: 'Staff',
      dateOfBirth: new Date('1990-01-01').toISOString(),
      gender: 'Male',
      nationality: 'Indian',
      mobile: '1234567890',
      email: 'teststaff2@example.com',
      address: { current: '123 Test St' },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '0987654321'
      },
      departmentId: '6a75d2601ca0fb8a69f6a7df', // Just using tenant id as dummy objectid
      designationId: '6a75d2601ca0fb8a69f6a7df',
      employmentType: 'Permanent',
      joiningDate: new Date().toISOString(),
      branchId: '',
      createUserAccount: true,
      isTeacher: false
    }, {
      headers: {
        'x-tenant-id': 'FIC001',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testOnboard();
