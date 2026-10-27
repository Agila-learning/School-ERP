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

    console.log('2. Submitting Admission Application...');
    const submitRes = await axios.post('http://localhost:5001/api/v1/admission/applications', {
      branchId: '66b5bd9e1a2b3c4d5e6f7a8b',
      academicYearId: '66b5bd9e1a2b3c4d5e6f7a8b',
      applyingClassId: '66b5bd9e1a2b3c4d5e6f7a8b',
      studentDetails: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2015-05-15').toISOString(),
        gender: 'Male',
        nationality: 'Indian'
      },
      parentDetails: {
        fatherName: 'Richard Doe',
        fatherMobile: '9876543210',
        motherName: 'Not Provided'
      },
      address: {
        current: '123 Main St',
        permanent: '123 Main St'
      }
    }, {
      headers: { 
        'x-tenant-id': 'FIC001',
        'Authorization': `Bearer ${token}` 
      }
    });

    const appId = submitRes.data.data._id;
    console.log(`Application submitted. ID: ${appId}`);

    console.log('3. Approving Admission Application...');
    const approveRes = await axios.post('http://localhost:5001/api/v1/admission/applications/approve', {
      applicationId: appId,
      assignedSectionId: '66b5bd9e1a2b3c4d5e6f7a8b',
      generatePortalAccess: true
    }, {
      headers: { 
        'x-tenant-id': 'FIC001',
        'Authorization': `Bearer ${token}` 
      }
    });

    console.log('Application approved. Student and Parent accounts created.');
    
    console.log('4. Fetching Student Directory...');
    // The endpoint is likely /api/v1/students/search or /api/v1/students
    const searchRes = await axios.get('http://localhost:5001/api/v1/students/search', {
      headers: { 
        'x-tenant-id': 'FIC001',
        'Authorization': `Bearer ${token}` 
      }
    });
    
    const student = searchRes.data.data.find(s => s.firstName === 'John' && s.lastName === 'Doe');
    if (student) {
      console.log(`Student found in directory! ID: ${student._id}`);
    } else {
      console.log('Student NOT found in directory.');
    }

  } catch (err) {
    console.error('Test failed:', err.response ? err.response.data : err.message);
  }
}

run();
