const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'admin@ficschool.edu',
      password: 'Admin@1234'
    }, {
      headers: {
        'x-tenant-id': 'FIC001'
      }
    });
    console.log('Login success!', res.data);
  } catch (err) {
    console.error('Login failed:', err.response ? err.response.data : err.message);
  }
}

testLogin();
