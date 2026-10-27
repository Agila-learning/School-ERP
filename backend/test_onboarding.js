const axios = require('axios');

async function testOnboarding() {
  try {
    const res = await axios.post('http://localhost:5001/api/v1/tenant/onboard', {
      schoolName: 'Test School',
      schoolCode: 'TST001',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      },
      adminName: 'Test Admin',
      adminEmail: 'admin@tst001.com',
      adminPassword: 'Password123!'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testOnboarding();
