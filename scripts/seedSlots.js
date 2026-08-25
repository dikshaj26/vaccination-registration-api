require('dotenv').config();
const dns = require('dns');
// Set DNS for MongoDB Atlas resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const Slot = require('../src/models/Slot');

// Time slots configuration (24-hour format for database consistency and easy sorting)
const slotsConfig = [
  { startTime: '10:00', endTime: '10:30' },
  { startTime: '10:30', endTime: '11:00' },
  { startTime: '11:00', endTime: '11:30' },
  { startTime: '11:30', endTime: '12:00' },
  { startTime: '12:00', endTime: '12:30' },
  { startTime: '12:30', endTime: '13:00' },
  { startTime: '13:00', endTime: '13:30' },
  { startTime: '13:30', endTime: '14:00' },
  { startTime: '14:00', endTime: '14:30' },
  { startTime: '14:30', endTime: '15:00' },
  { startTime: '15:00', endTime: '15:30' },
  { startTime: '15:30', endTime: '16:00' },
  { startTime: '16:00', endTime: '16:30' },
  { startTime: '16:30', endTime: '17:00' }
];

const seedSlots = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database.');

    // Clear existing slots first to avoid duplicates
    console.log('Clearing existing slots...');
    await Slot.deleteMany({});
    console.log('Existing slots cleared.');

    const slotsToSeed = [];

    // Loop through all 30 days of November 2024
    for (let day = 1; day <= 30; day++) {
      const dayString = day.toString().padStart(2, '0');
      const dateStr = `2024-11-${dayString}`;

      for (const slotTime of slotsConfig) {
        slotsToSeed.push({
          date: dateStr,
          startTime: slotTime.startTime,
          endTime: slotTime.endTime,
          capacity: 10,
          bookedCount: 0
        });
      }
    }

    console.log(`Generating ${slotsToSeed.length} slots...`);
    await Slot.insertMany(slotsToSeed);
    console.log('Successfully seeded 420 slots for November 2024!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding slots:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedSlots();
