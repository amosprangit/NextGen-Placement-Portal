// Force-resets the seeded admin's password to whatever is currently in
// .env (ADMIN_PASSWORD), going through the User model's normal save hook
// so it's hashed exactly the way login expects. Useful when you've
// changed ADMIN_PASSWORD in .env after the account already existed —
// `npm run seed` intentionally won't touch an existing account, so this
// is the safe way to sync it up without guessing at mongosh/database state.
//
// Usage:  npm run reset-admin-password

require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.');
    process.exit(1);
  }

  const email = ADMIN_EMAIL.toLowerCase().trim();
  const user = await User.findOne({ email });

  if (!user) {
    console.error(`No account found for ${email} in this database.`);
    console.error('This means the seed script has never successfully created it here —');
    console.error('run `npm run seed` first, then this script only if you need to change the password later.');
    process.exit(1);
  }

  if (user.role !== 'admin') {
    console.error(`An account exists for ${email} but its role is "${user.role}", not "admin". Refusing to touch it.`);
    process.exit(1);
  }

  user.password = ADMIN_PASSWORD; // pre-save hook re-hashes this
  await user.save();

  console.log(`Password reset for ${user.email}. Log in with the ADMIN_PASSWORD currently in your .env.`);
  process.exit(0);
};

run().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
