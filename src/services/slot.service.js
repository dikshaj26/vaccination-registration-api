const Slot = require('../models/Slot');

// Business logic to get all available slots for a given date
const getAvailableSlots = async (date) => {
  // Retrieve slots for the specified date where bookedCount is less than capacity (10)
  // Sorted chronologically by start time
  const slots = await Slot.find({
    date: date,
    bookedCount: { $lt: 10 }
  }).sort({ startTime: 1 });

  return slots;
};

module.exports = {
  getAvailableSlots
};
