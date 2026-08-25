require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const Slot = require('../src/models/Slot');
const Booking = require('../src/models/Booking');
const { getCurrentTime } = require('../src/utils/date');

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find slot 1 (Nov 1st, 10:00)
    const slot = await Slot.findOne({ date: '2024-11-01', startTime: '10:00' });
    if (!slot) {
      console.log('Slot not found');
      process.exit(1);
    }

    const [year, month, day] = slot.date.split('-').map(Number);
    const [hours, minutes] = slot.startTime.split(':').map(Number);
    const slotStartDateTime = new Date(year, month - 1, day, hours, minutes, 0);

    const changeDeadline = new Date(slotStartDateTime.getTime() - 24 * 60 * 60 * 1000);
    const now = getCurrentTime();

    console.log('--------------------------------------------------');
    console.log('DEBUG DETAILS:');
    console.log('MOCK_DATE Env:', process.env.MOCK_DATE);
    console.log('getCurrentTime():', now.toString(), `(Epoch: ${now.getTime()})`);
    console.log('Slot Date/Time:', slot.date, slot.startTime);
    console.log('slotStartDateTime:', slotStartDateTime.toString(), `(Epoch: ${slotStartDateTime.getTime()})`);
    console.log('changeDeadline:', changeDeadline.toString(), `(Epoch: ${changeDeadline.getTime()})`);
    console.log('Is now > changeDeadline?', now > changeDeadline);
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

debug();
