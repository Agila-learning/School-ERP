const mongoose = require('mongoose');

async function fixRoles() {
  try {
    const uri = 'mongodb://127.0.0.1:27017/school_erp'; 
    await mongoose.connect(uri);
    console.log('Connected to DB school_erp');
    
    const db = mongoose.connection.db;
    
    // Find all roles
    const roles = await db.collection('roles').find({}).toArray();
    for (const r of roles) {
      if (!r.permissions.includes('*')) {
        await db.collection('roles').updateOne({ _id: r._id }, { $addToSet: { permissions: '*' } });
        console.log(`Added '*' to role ${r.name}`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

fixRoles();
