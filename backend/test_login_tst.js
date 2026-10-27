const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'admin@tst001.com',
      password: 'Password123!'
    }, {
      headers: {
        'x-tenant-id': 'TST001'
      }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testLogin();
