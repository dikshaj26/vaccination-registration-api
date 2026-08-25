const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: [true, 'Slot ID is required']
  },
  doseNumber: {
    type: Number,
    required: [true, 'Dose number is required'],
    enum: [1, 2]
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED',
    required: true
  },
  bookedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for fast lookup
bookingSchema.index({ userId: 1 });
bookingSchema.index({ slotId: 1 });
bookingSchema.index({ doseNumber: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
