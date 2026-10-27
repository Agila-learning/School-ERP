const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  const db = mongoose.connection.db;

  // 1. Upsert Tenant
  let tenant = await db.collection('tenants').findOne({ code: 'FIC001' });
  if (!tenant) {
    const result = await db.collection('tenants').insertOne({
      name: 'FIC International School',
      code: 'FIC001',
      status: 'active',
      address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      contactEmail: 'admin@ficschool.edu',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    tenant = { _id: result.insertedId };
    console.log('Tenant created:', tenant._id.toString());
  } else {
    console.log('Tenant exists:', tenant._id.toString());
  }
  const tenantId = tenant._id;

  // 2. Upsert Role
  let role = await db.collection('roles').findOne({ tenantId: tenantId, name: 'Super Admin' });
  if (!role) {
    const result = await db.collection('roles').insertOne({
      tenantId: tenantId,
      name: 'Super Admin',
      permissions: ['*'],
      isSystem: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    role = { _id: result.insertedId };
    console.log('Role created:', role._id.toString());
  } else {
    console.log('Role exists:', role._id.toString());
  }

  // 3. Upsert Admin User
  const email = 'admin@ficschool.edu';
  const plainPassword = 'Admin@1234';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  let user = await db.collection('users').findOne({ tenantId: tenantId, email: email });
  if (!user) {
    const result = await db.collection('users').insertOne({
      tenantId: tenantId,
      firstName: 'Super',
      lastName: 'Admin',
      email: email,
      password: hashedPassword,
      roleIds: [role._id],
      accountStatus: 'active',
      failedLoginAttempts: 0,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Admin user created:', result.insertedId.toString());
  } else {
    const update = { password: hashedPassword, accountStatus: 'active', failedLoginAttempts: 0 };
    await db.collection('users').updateOne({ _id: user._id }, { $set: update });
    console.log('Admin user password reset. ID:', user._id.toString());
  }

  console.log('');
  console.log('================================================');
  console.log('  LOGIN CREDENTIALS');
  console.log('================================================');
  console.log('  URL     : http://localhost:5173');
  console.log('  Email   : ' + email);
  console.log('  Password: ' + plainPassword);
  console.log('================================================');

  await mongoose.disconnect();
}

seed().catch(function(err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
