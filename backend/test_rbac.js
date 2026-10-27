const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:5001/api/v1';

async function testRBAC() {
  console.log('--- Testing RBAC & Dashboard Redirects ---\n');
  
  try {
    // 1. Login as Admin
    console.log('Logging in as Admin...');
    const adminRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@ficschool.edu',
      password: 'Admin@1234'
    }, { headers: { 'x-tenant-id': 'FIC001' } });
    
    const adminToken = adminRes.data.data.token;
    console.log('✅ Admin Login Success');
    console.log(`➡️  Dashboard Route: ${adminRes.data.data.dashboardRoute}`);
    if (adminRes.data.data.dashboardRoute !== '/admin/dashboard') {
      console.error('❌ Admin was not redirected to /admin/dashboard');
    }

    // 2. Try to access User Management (Admin allowed)
    console.log('\nAdmin fetching users (Requires users.view)...');
    try {
      const usersRes = await axios.get(`${API_URL}/users`, {
        headers: { 
          'x-tenant-id': 'FIC001',
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log(`✅ Admin fetched ${usersRes.data.data.length} users`);
    } catch (e) {
      console.error('❌ Admin failed to fetch users:', e.response?.status, e.response?.data);
    }

    console.log('\n--- Test Complete ---');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testRBAC();
