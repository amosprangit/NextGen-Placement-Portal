require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`CareerConnect API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  // Fail loudly instead of leaving the process in a half-broken state.
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

start();
