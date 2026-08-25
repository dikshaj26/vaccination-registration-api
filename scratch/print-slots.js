require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const Slot = require('../src/models/Slot');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    return Slot.find({ date: '2024-11-01' }).sort({ startTime: 1 }).limit(3);
  })
  .then(slots => {
    console.log(slots.map(s => ({ startTime: s.startTime, id: s._id.toString() })));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error querying database:', err);
    process.exit(1);
  });
