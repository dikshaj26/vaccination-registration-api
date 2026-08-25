const Booking = require('../models/Booking');
const User = require('../models/User');
const { getCurrentTime } = require('../utils/date');

/**
 * Checks all active bookings for a user and updates them to COMPLETED
 * if the slot time has passed. Then recalculates and updates the user's vaccinationStatus.
 * @param {string} userId - The MongoDB ID of the user.
 * @returns {Promise<string>} - The updated vaccination status.
 */
const checkAndUpdateVaccinationStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Find all SCHEDULED bookings for this user
  const scheduledBookings = await Booking.find({
    userId: userId,
    status: 'SCHEDULED'
  }).populate('slotId');

  const now = getCurrentTime();
  let statusChanged = false;

  for (const booking of scheduledBookings) {
    if (!booking.slotId) continue;

    const slot = booking.slotId;
    
    // Parse slot date and end time safely into a local Date object
    const [year, month, day] = slot.date.split('-').map(Number);
    const [hours, minutes] = slot.endTime.split(':').map(Number);
    const slotEndDateTime = new Date(year, month - 1, day, hours, minutes, 0);

    // If current time is past the slot end time, mark it COMPLETED
    if (now > slotEndDateTime) {
      booking.status = 'COMPLETED';
      await booking.save();
      statusChanged = true;
    }
  }

  // Fetch all bookings (SCHEDULED and COMPLETED) to evaluate current vaccination status
  const allBookings = await Booking.find({
    userId: userId,
    status: { $in: ['SCHEDULED', 'COMPLETED'] }
  });

  const completedDoses = allBookings
    .filter(b => b.status === 'COMPLETED')
    .map(b => b.doseNumber);

  let newStatus = 'NONE';
  if (completedDoses.includes(2)) {
    newStatus = 'ALL_COMPLETED';
  } else if (completedDoses.includes(1)) {
    newStatus = 'FIRST_DOSE_COMPLETED';
  }

  // Update user database status if it changed
  if (user.vaccinationStatus !== newStatus) {
    user.vaccinationStatus = newStatus;
    await user.save();
  }

  return newStatus;
};

module.exports = {
  checkAndUpdateVaccinationStatus
};
