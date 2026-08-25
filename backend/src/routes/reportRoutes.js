'use strict';

const express = require('express');
const router = express.Router();

const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');
const {
  handleGetCanteenStatus,
  handleGetViolationReports,
} = require('../controllers/reportController');

// All dashboard and report routes require JWT authentication
router.use(verifyToken);

// GET /api/v1/dashboard/canteen-status (Accessible to all authenticated roles)
router.get('/dashboard/canteen-status', handleGetCanteenStatus);

// GET /api/v1/reports/violations (Restricted to Admin and Executive roles ONLY)
router.get('/reports/violations', requireRoles('admin', 'executive'), handleGetViolationReports);

module.exports = router;
