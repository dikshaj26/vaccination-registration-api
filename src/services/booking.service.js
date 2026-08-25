const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');
const vaccinationService = require('./vaccination.service');
const { getCurrentTime } = require('../utils/date');

// Business logic to book a vaccination slot
const bookSlot = async (userId, slotId, doseNumber) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = await vaccinationService.checkAndUpdateVaccinationStatus(userId);

  if (doseNumber === 1) {
    if (currentStatus !== 'NONE') {
      const error = new Error('You cannot book first dose. You have already completed it or registered for it.');
      error.statusCode = 400;
      throw error;
    }
  } else if (doseNumber === 2) {
    if (currentStatus === 'NONE') {
      const error = new Error('You cannot book second dose before completing the first dose.');
      error.statusCode = 400;
      throw error;
    }
    if (currentStatus === 'ALL_COMPLETED') {
      const error = new Error('You cannot book second dose. You are already fully vaccinated.');
      error.statusCode = 400;
      throw error;
    }
  } else {
    const error = new Error('Invalid dose number');
    error.statusCode = 400;
    throw error;
  }

  const activeBooking = await Booking.findOne({
    userId: userId,
    doseNumber: doseNumber,
    status: 'SCHEDULED'
  });
  if (activeBooking) {
    const error = new Error(`You already have an active scheduled booking for dose ${doseNumber}.`);
    error.statusCode = 409;
    throw error;
  }

  const slot = await Slot.findById(slotId);
  if (!slot) {
    const error = new Error('Selected slot does not exist');
    error.statusCode = 404;
    throw error;
  }

  const updatedSlot = await Slot.findOneAndUpdate(
    {
      _id: slotId,
      bookedCount: { $lt: 10 }
    },
    {
      $inc: { bookedCount: 1 }
    },
    {
      new: true
    }
  );

  if (!updatedSlot) {
    const error = new Error('Slot is already full');
    error.statusCode = 409;
    throw error;
  }

  const booking = new Booking({
    userId,
    slotId,
    doseNumber,
    status: 'SCHEDULED'
  });

  await booking.save();
  const populatedBooking = await booking.populate('slotId');
  return populatedBooking;
};

// Retrieve a user's bookings
const getUserBookings = async (userId) => {
  await vaccinationService.checkAndUpdateVaccinationStatus(userId);
  return await Booking.find({ userId }).populate('slotId').sort({ bookedAt: -1 });
};

// Business logic to modify an existing vaccination booking slot
// Uses MongoDB replica-set transaction sessions to guarantee consistency
const changeBookingSlot = async (userId, bookingId, newSlotId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Retrieve the active scheduled booking
    const booking = await Booking.findOne({ _id: bookingId, userId: userId }).session(session);
    if (!booking) {
      const error = new Error('Booking not found or does not belong to user');
      error.statusCode = 404;
      throw error;
    }

    if (booking.status !== 'SCHEDULED') {
      const error = new Error(`Cannot change slot. Booking status is ${booking.status}`);
      error.statusCode = 400;
      throw error;
    }

    // 2. Fetch the old slot details to evaluate the 24-hour restriction rule
    const oldSlot = await Slot.findById(booking.slotId).session(session);
    if (!oldSlot) {
      const error = new Error('Old slot record not found');
      error.statusCode = 404;
      throw error;
    }

    // Parse the old slot date and starting time into a Date object
    const [year, month, day] = oldSlot.date.split('-').map(Number);
    const [hours, minutes] = oldSlot.startTime.split(':').map(Number);
    const slotStartDateTime = new Date(year, month - 1, day, hours, minutes, 0);

    // Calculate the deadline (24 hours prior to slot start)
    const changeDeadline = new Date(slotStartDateTime.getTime() - 24 * 60 * 60 * 1000);
    const now = getCurrentTime(); // Used mocked time if configured in .env

    if (now > changeDeadline) {
      const error = new Error('Slots can only be modified up to 24 hours prior to the scheduled time');
      error.statusCode = 400;
      throw error;
    }

    // 3. Make sure they are not switching to the exact same slot
    if (booking.slotId.toString() === newSlotId.toString()) {
      const error = new Error('New slot is identical to the currently registered slot');
      error.statusCode = 400;
      throw error;
    }

    // 4. Check if the new slot exists
    const newSlot = await Slot.findById(newSlotId).session(session);
    if (!newSlot) {
      const error = new Error('Selected new slot does not exist');
      error.statusCode = 404;
      throw error;
    }

    // 5. Concurrency Safety: Attempt to reserve capacity on the new slot
    const updatedNewSlot = await Slot.findOneAndUpdate(
      {
        _id: newSlotId,
        bookedCount: { $lt: 10 } // Only increment if space is available
      },
      {
        $inc: { bookedCount: 1 }
      },
      {
        new: true,
        session
      }
    );

    if (!updatedNewSlot) {
      const error = new Error('Selected new slot is already full');
      error.statusCode = 409;
      throw error;
    }

    // 6. Release capacity from the old slot
    await Slot.findByIdAndUpdate(
      oldSlot._id,
      {
        $inc: { bookedCount: -1 }
      },
      {
        session
      }
    );

    // 7. Update booking document with the new slot reference
    booking.slotId = newSlotId;
    await booking.save({ session });

    // Commit all changes atomically
    await session.commitTransaction();

    const populatedBooking = await Booking.findById(booking._id).populate('slotId');
    return populatedBooking;
  } catch (error) {
    // If any database operation fails, rollback all changes
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  bookSlot,
  getUserBookings,
  changeBookingSlot
};
