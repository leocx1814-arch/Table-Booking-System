'use strict';

const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const {
  handleCreateBooking,
  handleCheckIn,
  handleCheckOut,
  handleGetActiveBooking,
} = require('../controllers/bookingController');

// All booking routes require JWT authentication
router.use(verifyToken);

// GET /api/v1/users/bookings/active
router.get('/active', handleGetActiveBooking);

// POST /api/v1/users/bookings
router.post('/', handleCreateBooking);

// POST /api/v1/users/bookings/:id/check-in
router.post('/:id/check-in', handleCheckIn);

// POST /api/v1/users/bookings/:id/check-out
router.post('/:id/check-out', handleCheckOut);

module.exports = router;
