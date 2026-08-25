'use strict';

const express = require('express');
const router = express.Router();

const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');
const {
  handleAssignComplaint,
  handleUpdateComplaintStatus,
} = require('../controllers/inspectorController');

// All inspector endpoints require authentication + inspector or admin role
const inspectorAuth = [verifyToken, requireRoles('inspector', 'admin')];

// POST /api/v1/complaints/:id/assign
router.post('/complaints/:id/assign', inspectorAuth, handleAssignComplaint);

// PATCH /api/v1/complaints/:id/status
router.patch('/complaints/:id/status', inspectorAuth, handleUpdateComplaintStatus);

module.exports = router;

