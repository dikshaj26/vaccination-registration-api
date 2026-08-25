const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');
const slotRoutes = require('./routes/slot.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Request logging in development
app.use(morgan('dev'));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health Check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is up and running'
  });
});

// Centralized error handler (Must be loaded last)
app.use(errorHandler);

module.exports = app;
