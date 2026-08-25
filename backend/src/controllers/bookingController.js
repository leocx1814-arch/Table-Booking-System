'use strict';

const bookingService = require('../services/bookingService');

/**
 * POST /api/v1/users/bookings
 * Create a new booking.
 */
async function handleCreateBooking(req, res, next) {
  try {
    const userId = req.user.id;
    const { table_id } = req.body;

    if (!table_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TABLE_ID',
          message: 'กรุณาระบุหมายเลขรหัสโต๊ะ (table_id) ที่ต้องการจอง',
        },
      });
    }

    const booking = await bookingService.createBooking(userId, parseInt(table_id, 10));

    return res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    if (err.statusCode) {
      res.statusCode = err.statusCode;
    }
    return next(err);
  }
}

/**
 * POST /api/v1/users/bookings/:id/check-in
 * Check-in using GPS location and optional QR code hash.
 */
async function handleCheckIn(req, res, next) {
  try {
    const userId = req.user.id;
    const bookingId = parseInt(req.params.id, 10);
    const { qr_code_hash, latitude, longitude } = req.body;

    if (isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BOOKING_ID',
          message: 'รหัสรายการจองไม่ถูกต้อง',
        },
      });
    }

    const updatedBooking = await bookingService.checkInBooking(userId, bookingId, {
      qr_code_hash,
      latitude,
      longitude,
    });

    return res.json({
      success: true,
      data: updatedBooking,
    });
  } catch (err) {
    if (err.statusCode) {
      res.statusCode = err.statusCode;
    }
    return next(err);
  }
}

/**
 * POST /api/v1/users/bookings/:id/check-out
 * Check-out of a booking.
 */
async function handleCheckOut(req, res, next) {
  try {
    const userId = req.user.id;
    const bookingId = parseInt(req.params.id, 10);

    if (isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BOOKING_ID',
          message: 'รหัสรายการจองไม่ถูกต้อง',
        },
      });
    }

    const updatedBooking = await bookingService.checkOutBooking(userId, bookingId);

    return res.json({
      success: true,
      data: updatedBooking,
    });
  } catch (err) {
    if (err.statusCode) {
      res.statusCode = err.statusCode;
    }
    return next(err);
  }
}

/**
 * GET /api/v1/users/bookings/active
 * Get active or pending booking for current logged-in user.
 */
async function handleGetActiveBooking(req, res, next) {
  try {
    const userId = req.user.id;
    const activeBooking = await bookingService.getActiveBooking(userId);

    return res.json({
      success: true,
      data: activeBooking,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  handleCreateBooking,
  handleCheckIn,
  handleCheckOut,
  handleGetActiveBooking,
};
