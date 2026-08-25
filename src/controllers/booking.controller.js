const bookingService = require('../services/booking.service');
const { sendSuccess } = require('../utils/response');

// Controller handling vaccine slot booking requests
const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { slotId, doseNumber } = req.body;

    const booking = await bookingService.bookSlot(userId, slotId, doseNumber);

    const responseData = {
      bookingId: booking._id,
      doseNumber: booking.doseNumber,
      status: booking.status,
      bookedAt: booking.bookedAt,
      slot: {
        id: booking.slotId._id,
        date: booking.slotId.date,
        startTime: booking.slotId.startTime,
        endTime: booking.slotId.endTime
      }
    };

    return sendSuccess(res, 'Vaccination slot booked successfully', responseData, 201);
  } catch (error) {
    next(error);
  }
};

// Controller handling active user bookings retrieval
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookings = await bookingService.getUserBookings(userId);

    const formattedBookings = bookings.map(booking => ({
      bookingId: booking._id,
      doseNumber: booking.doseNumber,
      status: booking.status,
      bookedAt: booking.bookedAt,
      slot: booking.slotId ? {
        id: booking.slotId._id,
        date: booking.slotId.date,
        startTime: booking.slotId.startTime,
        endTime: booking.slotId.endTime
      } : null
    }));

    return sendSuccess(res, 'My bookings retrieved successfully', formattedBookings);
  } catch (error) {
    next(error);
  }
};

// Controller handling booking slot modification requests
const changeSlot = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;
    const { newSlotId } = req.body;

    const updatedBooking = await bookingService.changeBookingSlot(userId, bookingId, newSlotId);

    const responseData = {
      bookingId: updatedBooking._id,
      doseNumber: updatedBooking.doseNumber,
      status: updatedBooking.status,
      updatedAt: updatedBooking.updatedAt,
      slot: {
        id: updatedBooking.slotId._id,
        date: updatedBooking.slotId.date,
        startTime: updatedBooking.slotId.startTime,
        endTime: updatedBooking.slotId.endTime
      }
    };

    return sendSuccess(res, 'Booking slot changed successfully', responseData, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  changeSlot
};
