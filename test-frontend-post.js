const axios = require('axios');

async function testPost() {
  try {
    const loginRes = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123',
      tenantId: 'demo-school'
    });
    
    const token = loginRes.data.data.token;
    console.log('Got token:', token);
    
    // Attempt to fetch departments and designations
    const headers = { Authorization: `Bearer ${token}` };
    const depts = await axios.get('http://localhost:5001/api/v1/hr/departments', { headers });
    const desigs = await axios.get('http://localhost:5001/api/v1/hr/designations', { headers });
    
    const deptId = depts.data.data[0] ? depts.data.data[0]._id : '6ac8c9add182a096a120cba4';
    const desigId = desigs.data.data[0] ? desigs.data.data[0]._id : '6ac8c9add182a096a120cba5';

    const payload = {
      firstName: 'Api',
      lastName: 'Test',
      dateOfBirth: new Date().toISOString(),
      gender: 'Male',
      nationality: 'Indian',
      mobile: '9876543210',
      email: 'apitest' + Date.now() + '@example.com',
      address: { current: '123 Test St' },
      emergencyContact: {
        name: 'Api Friend',
        relationship: 'Friend',
        phone: '1234567890'
      },
      departmentId: deptId,
      designationId: desigId,
      employmentType: 'Permanent',
      joiningDate: new Date().toISOString(),
      branchId: '',
      createUserAccount: true,
      isTeacher: false
    };

    console.log('Sending payload:', payload);

    const res = await axios.post('http://localhost:5001/api/v1/hr/employees', payload, { headers });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.error('ERROR RESPONSE:', err.response ? err.response.data : err.message);
  }
}

testPost();
