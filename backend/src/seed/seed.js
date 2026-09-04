// Creates (or updates) the single placement-cell admin account from
// environment variables. Admin accounts are intentionally NOT createable
// through a public API route — this script is the only way to make one,
// which keeps the "admin" role from ever being self-assignable over HTTP.
//
// Usage:  npm run seed

require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const AdminProfile = require('../models/AdminProfile');
const { ROLES } = require('../config/constants');

const run = async () => {
  await connectDB();

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding.');
    process.exit(1);
  }

  let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (admin) {
    console.log(`Admin already exists: ${admin.email}. No changes made.`);
  } else {
    admin = await User.create({
      name: ADMIN_NAME || 'Placement Cell Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: ROLES.ADMIN,
    });
    await AdminProfile.create({ user: admin._id, designation: 'Root Administrator' });
    console.log(`Admin account created: ${admin.email}`);
    console.log('Log in with the password set in your .env (ADMIN_PASSWORD).');
    console.log('This admin can create further admin accounts from the dashboard (POST /api/admin/admins).');
  }

  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
