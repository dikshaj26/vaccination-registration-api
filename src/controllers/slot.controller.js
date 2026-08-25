const slotService = require('../services/slot.service');
const { sendSuccess } = require('../utils/response');

// Controller handling slots retrieval
const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const slots = await slotService.getAvailableSlots(date);

    // Format output data to omit internal database fields (__v, createdAt, etc.)
    const formattedSlots = slots.map(slot => ({
      id: slot._id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      remainingCapacity: slot.capacity - slot.bookedCount
    }));

    return sendSuccess(res, 'Available slots retrieved successfully', formattedSlots);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableSlots
};
