require('dotenv').config();
const dns = require('dns');
// Set DNS for MongoDB Atlas resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const Admin = require('../src/models/Admin');

const seedAdmin = async () => {
  try {
    console.log('Connecting to database for admin seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database.');

    const adminUsername = 'admin';
    const adminPassword = 'AdminPassword123';

    // Clear any existing admin with the same username
    console.log(`Checking and clearing existing admin user: ${adminUsername}...`);
    await Admin.deleteMany({ username: adminUsername });

    // Create new admin user
    // The pre-save middleware in models/Admin.js will automatically hash the password
    const newAdmin = new Admin({
      username: adminUsername,
      password: adminPassword,
      role: 'admin'
    });

    await newAdmin.save();
    console.log('--------------------------------------------------');
    console.log('Successfully created Admin Account!');
    console.log(`Username: ${adminUsername}`);
    console.log(`Password: ${adminPassword}`);
    console.log('--------------------------------------------------');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();
