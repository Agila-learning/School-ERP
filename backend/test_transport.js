const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:5001/api/v1';

async function runE2E() {
  try {
    console.log('--- LOGGING IN ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@ficschool.edu',
      password: 'Admin@1234'
    }, {
      headers: { 'x-tenant-id': 'FIC001' }
    });
    const token = loginRes.data.data.token;
    const headers = { 'x-tenant-id': 'FIC001', 'Authorization': `Bearer ${token}` };
    console.log('✅ Logged in successfully.');

    console.log('--- STARTING PHASE 107 TRANSPORT E2E TEST ---');

    // 1. Create Vehicle
    console.log('1. Creating Vehicle...');
    const uniqueSuffix = Date.now();
    const vehicleRes = await axios.post(`${API_URL}/transport/vehicles`, {
      branchId: '650000000000000000000000',
      vehicleNumber: `BUS-${uniqueSuffix}`,
      registrationNumber: `REG-${uniqueSuffix}`,
      vehicleType: 'BUS',
      manufacturer: 'Tata Motors',
      modelName: 'Marcopolo',
      manufacturingYear: 2020,
      seatingCapacity: 40,
      totalCapacity: 50,
      fuelType: 'DIESEL'
    }, { headers });
    const vehicle = vehicleRes.data.data;
    assert.ok(vehicle._id, 'Vehicle creation failed');
    console.log('✅ Vehicle created:', vehicle.vehicleNumber);

    // 2. Create Staff (Driver)
    console.log('2. Creating Transport Staff (Driver)...');
    // Generate a random 24-character hex string for ObjectId
    const fakeEmployeeId = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const staffRes = await axios.post(`${API_URL}/transport/staff`, {
      employeeId: fakeEmployeeId,
      roleType: 'DRIVER',
      licenseNumber: `LIC-${uniqueSuffix}`,
      licenseExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString()
    }, { headers });
    const driver = staffRes.data.data;
    assert.ok(driver._id, 'Driver creation failed');
    console.log('✅ Driver created:', driver.licenseNumber);

    // 3. Create Route
    console.log('3. Creating Route...');
    const routeRes = await axios.post(`${API_URL}/transport/routes`, {
      name: 'North Bangalore Route',
      code: `RTE-NORTH-${uniqueSuffix}`,
      direction: 'BOTH',
      startPoint: 'School Campus',
      endPoint: 'Hebbal',
      estimatedDurationMinutes: 60,
      branchId: '650000000000000000000000',
      academicYearId: '650000000000000000000000',
      defaultVehicleId: vehicle._id,
      defaultDriverId: driver.employeeId
    }, { headers });
    const route = routeRes.data.data;
    assert.ok(route._id, 'Route creation failed');
    console.log('✅ Route created:', route.name);

    // 4. Create Route Stops
    console.log('4. Creating Route Stops...');
    const stop1Res = await axios.post(`${API_URL}/transport/routes/${route._id}/stops`, {
      name: 'Hebbal',
      sequence: 1,
      pickupTime: '08:00',
      dropoffTime: '15:30'
    }, { headers });
    const stop1 = stop1Res.data.data;
    assert.ok(stop1._id, 'Stop creation failed');
    console.log('✅ Stop 1 created:', stop1.name);

    // 5. Assign Student (Testing Capacity)
    console.log('5. Assigning Student to Transport...');
    const fakeStudentId = '650000000000000000000002';
    const assignRes = await axios.post(`${API_URL}/transport/assignments`, {
      studentId: fakeStudentId,
      routeId: route._id,
      pickupStopId: stop1._id,
      dropoffStopId: stop1._id,
      effectiveFrom: new Date().toISOString(),
      feeAmount: 15000,
      academicYearId: '650000000000000000000000',
      branchId: '650000000000000000000000'
    }, { headers });
    const assignment = assignRes.data.data;
    assert.ok(assignment._id, 'Assignment failed');
    console.log('✅ Student Assigned. Transport Fee generated (virtually).');

    // 6. Maintenance
    console.log('6. Adding Maintenance Record...');
    const maintRes = await axios.post(`${API_URL}/transport/maintenance`, {
      vehicleId: vehicle._id,
      maintenanceType: 'OIL_CHANGE',
      serviceDate: new Date().toISOString(),
      odometerReading: 12000,
      cost: 5000
    }, { headers });
    assert.ok(maintRes.data.data._id, 'Maintenance creation failed');
    console.log('✅ Maintenance recorded.');

    // 7. Cleanup
    console.log('7. Cleaning up test data...');
    await axios.delete(`${API_URL}/transport/assignments/${assignment._id}`, { headers });
    await axios.delete(`${API_URL}/transport/routes/${route._id}/stops/${stop1._id}`, { headers });
    await axios.delete(`${API_URL}/transport/routes/${route._id}`, { headers });
    await axios.delete(`${API_URL}/transport/staff/${driver._id}`, { headers });
    await axios.delete(`${API_URL}/transport/maintenance/${maintRes.data.data._id}`, { headers });
    await axios.delete(`${API_URL}/transport/vehicles/${vehicle._id}`, { headers });
    
    console.log('✅ Cleanup successful.');
    console.log('--- ALL TESTS PASSED SUCCESSFULLY ---');

  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err.response?.data || err.message);
  }
}

runE2E();
