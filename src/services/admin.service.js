const Admin = require('../models/Admin');
const User = require('../models/User');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const { generateToken } = require('../utils/jwt');
const vaccinationService = require('./vaccination.service');

// Business logic for Admin login
const loginAdmin = async (username, password) => {
  const admin = await Admin.findOne({ username });
  if (!admin) {
    const error = new Error('Admin credentials not found');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid admin password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(admin._id, 'admin');
  return { admin, token };
};

// Business logic to get all registered users with optional filters
const getRegisteredUsers = async (filters) => {
  // 1. Run dynamic vaccination status updates for all users first.
  // This ensures the admin gets real-time data instead of stale statuses.
  const allUsers = await User.find({});
  for (const user of allUsers) {
    await vaccinationService.checkAndUpdateVaccinationStatus(user._id);
  }

  // 2. Build the query object based on filters provided
  const query = {};
  if (filters.age) {
    query.age = Number(filters.age);
  }
  if (filters.pincode) {
    query.pincode = filters.pincode;
  }
  if (filters.status) {
    query.vaccinationStatus = filters.status;
  }

  // 3. Query the database (excluding password field)
  const users = await User.find(query).select('-password -createdAt -updatedAt -__v');
  
  return {
    totalMatchingUsers: users.length,
    users
  };
};

// Business logic to get slot registration statistics for a given day
const getSlotStatistics = async (date) => {
  // 1. Find all slot IDs generated for the requested date
  const slots = await Slot.find({ date });
  const slotIds = slots.map(slot => slot._id);

  // 2. Query bookings matching those slots (excluding CANCELLED bookings)
  const bookings = await Booking.find({
    slotId: { $in: slotIds },
    status: { $in: ['SCHEDULED', 'COMPLETED'] }
  });

  // 3. Count doses
  const firstDoseRegistrations = bookings.filter(b => b.doseNumber === 1).length;
  const secondDoseRegistrations = bookings.filter(b => b.doseNumber === 2).length;
  const totalRegistrations = bookings.length;

  return {
    date,
    firstDoseRegistrations,
    secondDoseRegistrations,
    totalRegistrations
  };
};

module.exports = {
  loginAdmin,
  getRegisteredUsers,
  getSlotStatistics
};
