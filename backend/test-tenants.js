const mongoose = require('mongoose');
const { env } = require('./src/config/env');
const Tenant = require('./src/modules/tenant/models/Tenant.model').default;

mongoose.connect(env.mongoUri).then(async () => {
  const t = await Tenant.find({}, 'code name status');
  console.log(t);
  process.exit();
});
