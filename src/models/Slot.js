const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: [true, 'Slot date is required']
  },
  startTime: {
    type: String, // Format: HH:MM (e.g., "10:00")
    required: [true, 'Slot start time is required']
  },
  endTime: {
    type: String, // Format: HH:MM (e.g., "10:30")
    required: [true, 'Slot end time is required']
  },
  capacity: {
    type: Number,
    default: 10,
    required: true
  },
  bookedCount: {
    type: Number,
    default: 0,
    min: [0, 'Booked count cannot be negative'],
    max: [10, 'Booked count cannot exceed capacity'],
    required: true
  }
}, {
  timestamps: true
});

// Indexes for fast querying of slots by date and time
slotSchema.index({ date: 1 });
// Compound index to ensure uniqueness of date + start time combinations
slotSchema.index({ date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
