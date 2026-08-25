const dns = require('dns');
// Force Node.js to use Google and Cloudflare DNS to resolve MongoDB Atlas SRV records.
// This resolves the common querySrv ECONNREFUSED error on local networks.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
