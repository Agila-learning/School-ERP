const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TenantSchema = new mongoose.Schema({
  name: String,
  code: String,
  subdomain: String,
  plan: String,
  status: String,
}, { timestamps: true });

const RoleSchema = new mongoose.Schema({
  tenantId: mongoose.Schema.Types.ObjectId,
  name: String,
  permissions: [String],
  isSystem: Boolean,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  tenantId: mongoose.Schema.Types.ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  password: { type: String, required: false },
  roleIds: [mongoose.Schema.Types.ObjectId],
  accountStatus: String,
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const seedSystem = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Create System Tenant
    const systemCode = 'SYSTEM';
    let systemTenant = await Tenant.findOne({ code: systemCode });
    if (!systemTenant) {
      systemTenant = await Tenant.create({
        name: 'SaaS Platform Admin',
        code: systemCode,
        subdomain: systemCode.toLowerCase(),
        plan: 'enterprise',
        status: 'active',
      });
      console.log('Created System Tenant');
    } else {
      console.log('System Tenant already exists');
    }

    // Create Super Admin Role
    let superAdminRole = await Role.findOne({ tenantId: systemTenant._id, name: 'Super Admin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        tenantId: systemTenant._id,
        name: 'Super Admin',
        permissions: ['*'],
        isSystem: true,
      });
      console.log('Created Super Admin Role');
    }

    // Create Super Admin User
    const adminEmail = 'superadmin@schoolerp.cloud';
    let adminUser = await User.findOne({ tenantId: systemTenant._id, email: adminEmail });
    if (!adminUser) {
      adminUser = new User({
        tenantId: systemTenant._id,
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: 'Password123!',
        roleIds: [superAdminRole._id],
        accountStatus: 'active',
      });
      await adminUser.save();
      console.log('Created Super Admin User: superadmin@schoolerp.cloud / Password123!');
    } else {
      console.log('Super Admin User already exists');
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding system:', error);
    process.exit(1);
  }
};

seedSystem();
